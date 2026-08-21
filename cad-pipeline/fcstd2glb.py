#!/usr/bin/env python3
"""FCStd (FreeCAD) -> GLB with one named node per part.

Reads the extracted Document.xml, pulls each Part::Feature's BREP shape,
tessellates it with OpenCascade, applies the object's placement, assigns a
material from a name-based rule table, and writes a single glTF-binary file
with every part kept as a separate, named mesh node.
"""
import os
import re
import sys
import xml.etree.ElementTree as ET

import numpy as np
import trimesh

from OCP.BRepTools import BRepTools
from OCP.BRep import BRep_Builder
from OCP.TopoDS import TopoDS_Shape, TopoDS
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE
from OCP.BRep import BRep_Tool
from OCP.TopLoc import TopLoc_Location

# linear deflection in mm — smaller = finer mesh. 0.35 is a good web/CAD balance.
LIN_DEFLECTION = 0.12
ANG_DEFLECTION = 0.25
APPLY_PLACEMENT = False


def read_brep(path):
    shape = TopoDS_Shape()
    builder = BRep_Builder()
    BRepTools.Read_s(shape, path, builder)
    return shape


def tessellate(shape):
    """Return (vertices Nx3 float64, faces Mx3 int) in shape-local coords."""
    BRepMesh_IncrementalMesh(shape, LIN_DEFLECTION, False, ANG_DEFLECTION, True)
    verts, faces = [], []
    exp = TopExp_Explorer(shape, TopAbs_FACE)
    while exp.More():
        face = TopoDS.Face_s(exp.Current())
        loc = TopLoc_Location()
        tri = BRep_Tool.Triangulation_s(face, loc)
        if tri is not None:
            trsf = loc.Transformation()
            base = len(verts)
            n_nodes = tri.NbNodes()
            for i in range(1, n_nodes + 1):
                p = tri.Node(i).Transformed(trsf)
                verts.append((p.X(), p.Y(), p.Z()))
            reversed_face = face.Orientation() == 1  # TopAbs_REVERSED
            for i in range(1, tri.NbTriangles() + 1):
                t = tri.Triangle(i)
                a, b, c = t.Value(1), t.Value(2), t.Value(3)
                if reversed_face:
                    a, c = c, a
                faces.append((base + a - 1, base + b - 1, base + c - 1))
        exp.Next()
    if not verts:
        return None, None
    return np.asarray(verts, dtype=np.float64), np.asarray(faces, dtype=np.int64)


def quat_to_matrix(q0, q1, q2, q3, px, py, pz):
    """FreeCAD stores (Q0,Q1,Q2,Q3) as (x,y,z,w)."""
    x, y, z, w = q0, q1, q2, q3
    n = (x * x + y * y + z * z + w * w) ** 0.5
    if n == 0:
        x, y, z, w = 0.0, 0.0, 0.0, 1.0
    else:
        x, y, z, w = x / n, y / n, z / n, w / n
    m = np.eye(4)
    m[:3, :3] = [
        [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
        [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
        [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
    ]
    m[:3, 3] = [px, py, pz]
    return m


# ---- material rules: first matching substring wins -------------------------
# (name_fragment, base_color RGBA 0-255, metallic, roughness)
MATERIAL_RULES = [
    ("BattLED",        (120, 230, 140, 255), 0.0, 0.35),
    ("PiLED",          (110, 220, 255, 255), 0.0, 0.35),
    ("BubbleLevel",    (215, 235, 245, 200), 0.0, 0.15),
    ("AntennaDome",    (245, 245, 245, 255), 0.0, 0.55),
    ("AntennaTrimRing",(230,  92,  32, 255), 0.3, 0.40),
    ("AntennaDisc",    ( 60,  62,  66, 255), 0.85, 0.35),
    ("Antenna",        ( 32,  34,  38, 255), 0.25, 0.50),
    ("BatteryRelease", (230,  92,  32, 255), 0.4, 0.40),
    ("BatteryModule",  ( 38,  40,  44, 255), 0.20, 0.55),
    ("Heatsink",       (150, 152, 156, 255), 0.90, 0.30),
    ("PiZero2W",       ( 20, 105,  70, 255), 0.10, 0.60),
    ("PiModuleBox",    ( 34,  36,  40, 255), 0.20, 0.55),
    ("CamLever",       (230,  92,  32, 255), 0.30, 0.45),
    ("CamCollar",      ( 55,  57,  62, 255), 0.70, 0.35),
    ("PoleSeg",        (168, 172, 178, 255), 0.90, 0.25),
    ("SurveyTip",      (110, 112, 118, 255), 0.95, 0.20),
    ("ARP_datum",      (230,  92,  32, 255), 0.20, 0.40),
    ("ThreadInterface",(140, 142, 148, 255), 0.90, 0.30),
    ("PhoneCradle",    ( 40,  42,  46, 255), 0.10, 0.65),
    ("PhoneMountBoss", ( 45,  47,  52, 255), 0.15, 0.60),
    ("Phone_ref",      ( 18,  19,  22, 255), 0.10, 0.25),
    ("BipodCollar",    ( 55,  57,  62, 255), 0.70, 0.35),
    ("TripodHead",     ( 48,  50,  55, 255), 0.60, 0.40),
    ("Leg1_foot",      ( 25,  26,  30, 255), 0.05, 0.80),
    ("Leg2_foot",      ( 25,  26,  30, 255), 0.05, 0.80),
    ("Leg3_foot",      ( 25,  26,  30, 255), 0.05, 0.80),
    ("_clamp",         (230,  92,  32, 255), 0.30, 0.45),
    ("_inner",         (150, 154, 160, 255), 0.90, 0.28),
    ("_outer",         (120, 124, 130, 255), 0.85, 0.32),
    ("LevelKnob",      ( 60,  62,  68, 255), 0.50, 0.45),
    ("CenteringPlate", ( 90,  92,  98, 255), 0.80, 0.35),
    ("CenterColumn",   (140, 144, 150, 255), 0.90, 0.28),
]
DEFAULT_MATERIAL = ((120, 122, 128, 255), 0.5, 0.5)


def material_for(name):
    for frag, color, metal, rough in MATERIAL_RULES:
        if frag.lower() in name.lower():
            return color, metal, rough
    return DEFAULT_MATERIAL


def convert(doc_dir, out_path):
    tree = ET.parse(os.path.join(doc_dir, "Document.xml"))
    root = tree.getroot()

    objdata = root.find("ObjectData")
    scene = trimesh.Scene()
    stats = []

    for obj in objdata.findall("Object"):
        name = obj.get("name")
        props = obj.find("Properties")
        shape_file = None
        placement = np.eye(4)
        visible = True

        for prop in props.findall("Property"):
            pname = prop.get("name")
            if pname == "Shape":
                part = prop.find("Part")
                if part is not None:
                    shape_file = part.get("file")
            elif pname == "Placement":
                pp = prop.find("PropertyPlacement")
                if pp is not None:
                    placement = quat_to_matrix(
                        float(pp.get("Q0", 0)), float(pp.get("Q1", 0)),
                        float(pp.get("Q2", 0)), float(pp.get("Q3", 1)),
                        float(pp.get("Px", 0)), float(pp.get("Py", 0)),
                        float(pp.get("Pz", 0)),
                    )
            elif pname == "Visibility":
                b = prop.find("Bool")
                if b is not None:
                    visible = b.get("value") == "true"

        if not shape_file:
            continue
        brep_path = os.path.join(doc_dir, shape_file)
        if not os.path.exists(brep_path):
            print(f"  !! missing shape file for {name}: {shape_file}")
            continue

        shape = read_brep(brep_path)
        verts, faces = tessellate(shape)
        if verts is None:
            print(f"  !! no geometry for {name}")
            continue

        mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=True)
        # NOTE: FreeCAD writes each Part::Feature's BREP with its location already
        # baked in, and *also* records the same transform as the object Placement
        # in Document.xml. Applying the placement here would double-transform any
        # part built with Shape.translate() (the LEDs, the bubble level) while
        # leaving parts built in place untouched — which looks exactly like a CAD
        # bug and is not one. So the placement is parsed for reference only.
        if APPLY_PLACEMENT:
            mesh.apply_transform(placement)

        color, metal, rough = material_for(name)
        mesh.visual = trimesh.visual.TextureVisuals(
            material=trimesh.visual.material.PBRMaterial(
                name=f"mat_{name}",
                baseColorFactor=[c / 255.0 for c in color],
                metallicFactor=metal,
                roughnessFactor=rough,
            )
        )
        mesh.metadata["name"] = name
        mesh.metadata["visible"] = visible
        scene.add_geometry(mesh, node_name=name, geom_name=name)
        stats.append((name, len(mesh.faces), visible))

    total = sum(s[1] for s in stats)
    print(f"\n{os.path.basename(out_path)}: {len(stats)} parts, {total:,} triangles")
    for n, f, v in sorted(stats, key=lambda s: -s[1])[:8]:
        print(f"    {n:<28} {f:>7,} tris")
    b = scene.bounds
    print(f"  bounds (mm): X {b[0][0]:.1f}..{b[1][0]:.1f}  "
          f"Y {b[0][1]:.1f}..{b[1][1]:.1f}  Z {b[0][2]:.1f}..{b[1][2]:.1f}")

    scene.export(out_path)
    print(f"  wrote {out_path}  ({os.path.getsize(out_path)/1e6:.2f} MB)")
    return scene


if __name__ == "__main__":
    convert(sys.argv[1], sys.argv[2])
