#!/usr/bin/env python3
"""STEP -> GLB, grouping anonymous solids back into named modules.

The new STEP files come from a three.js faceted writer: they carry no part
names, no colours and no assembly tree — just 120-160 anonymous solids. So we
rebuild the structure ourselves by position along the model's long axis, which
is reliable here because these products are literally a stack of modules on a
pole.

Each module becomes ONE merged mesh named for what it is, which is what the
viewer needs for hotspots and the exploded view.
"""
import sys
import json
import numpy as np
import trimesh

from OCP.STEPControl import STEPControl_Reader
from OCP.IFSelect import IFSelect_ReturnStatus
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID, TopAbs_FACE
from OCP.TopoDS import TopoDS
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRep import BRep_Tool
from OCP.TopLoc import TopLoc_Location
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib

LIN_DEFLECTION = 0.25
ANG_DEFLECTION = 0.4

MATERIALS = {
    'antenna':   ((236, 238, 240, 255), 0.05, 0.55),
    'radome':    ((242, 244, 246, 255), 0.02, 0.50),
    'gateway':   (( 32,  35,  39, 255), 0.25, 0.48),
    'heatsink':  ((148, 152, 158, 255), 0.88, 0.28),
    'battery':   (( 38,  41,  45, 255), 0.22, 0.52),
    'accent':    ((230,  92,  32, 255), 0.30, 0.42),
    'pole':      ((150, 155, 162, 255), 0.86, 0.26),
    'collar':    (( 52,  55,  60, 255), 0.70, 0.34),
    'tip':       ((112, 116, 122, 255), 0.94, 0.20),
    'phone':     (( 24,  26,  30, 255), 0.10, 0.40),
    'tripod':    ((132, 137, 144, 255), 0.84, 0.30),
    'foot':      (( 26,  28,  32, 255), 0.05, 0.78),
    'drone':     (( 30,  32,  36, 255), 0.18, 0.55),
    'prop':      (( 20,  22,  25, 255), 0.10, 0.62),
    'led':       ((118, 226, 140, 255), 0.00, 0.35),
    'default':   ((118, 122, 128, 255), 0.50, 0.48),
}


def read_solids(path):
    reader = STEPControl_Reader()
    if reader.ReadFile(path) != IFSelect_ReturnStatus.IFSelect_RetDone:
        raise RuntimeError(f'cannot read {path}')
    reader.TransferRoots()
    shape = reader.OneShape()
    solids = []
    exp = TopExp_Explorer(shape, TopAbs_SOLID)
    while exp.More():
        solids.append(TopoDS.Solid_s(exp.Current()))
        exp.Next()
    return solids


def tessellate(shape):
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
            for i in range(1, tri.NbNodes() + 1):
                p = tri.Node(i).Transformed(trsf)
                verts.append((p.X(), p.Y(), p.Z()))
            rev = face.Orientation() == 1
            for i in range(1, tri.NbTriangles() + 1):
                t = tri.Triangle(i)
                a, b, c = t.Value(1), t.Value(2), t.Value(3)
                if rev:
                    a, c = c, a
                faces.append((base + a - 1, base + b - 1, base + c - 1))
        exp.Next()
    if not verts:
        return None, None
    return np.asarray(verts, float), np.asarray(faces, int)


def bounds(solid):
    b = Bnd_Box()
    BRepBndLib.Add_s(solid, b, False)
    xmin, ymin, zmin, xmax, ymax, zmax = b.Get()
    return np.array([xmin, ymin, zmin]), np.array([xmax, ymax, zmax])




def synth_tube(y0, y1, r0, r1, sections=48, up=1):
    """Build a tapered tube (or cone) as a mesh, along the model's up axis.

    The new STEP exports are MISSING their main tubes — the rover has no pole
    and no tip, and the base station has no mast between the tripod head and the
    receiver stack. Everything else in those files is excellent, so rather than
    discard them we rebuild the missing cylinders from the dimensions in the
    original parametric FreeCAD script.

    THIS IS SYNTHESISED GEOMETRY, NOT CAD. It is visually right and
    dimensionally plausible, but it is not authoritative. Delete the "tubes"
    block from the plan JSON the moment a corrected STEP export exists.
    """
    ang = np.linspace(0, 2 * np.pi, sections, endpoint=False)
    ring0 = np.stack([np.cos(ang) * r0, np.zeros(sections), np.sin(ang) * r0], axis=1)
    ring1 = np.stack([np.cos(ang) * r1, np.zeros(sections), np.sin(ang) * r1], axis=1)
    ring0[:, up] = y0
    ring1[:, up] = y1
    verts = np.vstack([ring0, ring1])
    faces = []
    for i in range(sections):
        j = (i + 1) % sections
        faces.append([i, j, sections + j])
        faces.append([i, sections + j, sections + i])
    # caps
    c0 = len(verts); verts = np.vstack([verts, [[0, 0, 0]]]); verts[c0, up] = y0
    c1 = len(verts); verts = np.vstack([verts, [[0, 0, 0]]]); verts[c1, up] = y1
    for i in range(sections):
        j = (i + 1) % sections
        faces.append([c0, j, i])
        faces.append([c1, sections + i, sections + j])
    return trimesh.Trimesh(vertices=verts, faces=np.array(faces), process=True)


def convert(step_path, out_path, plan_path=None, dump_plan=False):
    solids = read_solids(step_path)
    boxes = [bounds(s) for s in solids]
    allo = np.min([b[0] for b in boxes], axis=0)
    ahi = np.max([b[1] for b in boxes], axis=0)
    size = ahi - allo
    up = int(np.argmax(size))

    plan = json.load(open(plan_path)) if plan_path else None

    # group solids into modules
    groups = {}
    for i, (lo, hi) in enumerate(boxes):
        centre = (lo[up] + hi[up]) / 2
        others = [a for a in range(3) if a != up]
        radial = max(hi[a] - lo[a] for a in others)
        name, mat = 'part', 'default'
        if plan:
            for band in plan['bands']:
                if band['from'] <= centre < band['to']:
                    if 'maxRadial' in band and radial > band['maxRadial']:
                        continue
                    if 'minRadial' in band and radial < band['minRadial']:
                        continue
                    name, mat = band['name'], band['material']
                    break
        else:
            name = f'part_{i:03d}'
        groups.setdefault((name, mat), []).append(i)

    if dump_plan:
        rows = sorted(
            ((float((b[0][up] + b[1][up]) / 2),
              float(b[1][up] - b[0][up]),
              float(max(b[1][a] - b[0][a] for a in range(3) if a != up)), i)
             for i, b in enumerate(boxes)))
        print(f'up axis = {"XYZ"[up]}  size = {size[0]:.0f} x {size[1]:.0f} x {size[2]:.0f}')
        print(f'{"centre":>9} {"span":>7} {"radial":>7}  n')
        # collapse identical rows so the listing is readable
        seen = {}
        for c, sp, r, i in rows:
            key = (round(c, 1), round(sp, 1), round(r, 1))
            seen[key] = seen.get(key, 0) + 1
        for (c, sp, r), n in sorted(seen.items()):
            print(f'{c:9.1f} {sp:7.1f} {r:7.1f}  x{n}')
        return None

    scene = trimesh.Scene()
    total = 0
    report = []
    for (name, mat), idxs in groups.items():
        meshes = []
        for i in idxs:
            v, f = tessellate(solids[i])
            if v is None:
                continue
            meshes.append(trimesh.Trimesh(vertices=v, faces=f, process=False))
        if not meshes:
            continue
        merged = trimesh.util.concatenate(meshes)
        merged.process(validate=True)
        colour, metal, rough = MATERIALS.get(mat, MATERIALS['default'])
        merged.visual = trimesh.visual.TextureVisuals(
            material=trimesh.visual.material.PBRMaterial(
                name=f'mat_{mat}',
                baseColorFactor=[c / 255 for c in colour],
                metallicFactor=metal,
                roughnessFactor=rough,
            ))
        scene.add_geometry(merged, node_name=name, geom_name=name)
        total += len(merged.faces)
        report.append((name, len(idxs), len(merged.faces)))

    # rebuild any tubes the export is missing (see synth_tube)
    for spec in (plan or {}).get('tubes', []):
        tube = synth_tube(spec['from'], spec['to'], spec['r0'], spec['r1'], up=up)
        colour, metal, rough = MATERIALS.get(spec['material'], MATERIALS['default'])
        tube.visual = trimesh.visual.TextureVisuals(
            material=trimesh.visual.material.PBRMaterial(
                name=f"mat_{spec['material']}",
                baseColorFactor=[c / 255 for c in colour],
                metallicFactor=metal, roughnessFactor=rough))
        scene.add_geometry(tube, node_name=spec['name'], geom_name=spec['name'])
        total += len(tube.faces)
        report.append((spec['name'] + ' *synth', 0, len(tube.faces)))

    scene.export(out_path)
    import os
    print(f'\n{os.path.basename(out_path)}: {len(report)} modules from {len(solids)} solids, '
          f'{total:,} triangles, {os.path.getsize(out_path)/1e6:.2f} MB')
    for n, s, f in sorted(report, key=lambda r: -r[2]):
        print(f'    {n:<22} {s:>4} solids  {f:>7,} tris')
    b = scene.bounds
    print(f'  bounds mm: {b[1][0]-b[0][0]:.0f} x {b[1][1]-b[0][1]:.0f} x {b[1][2]-b[0][2]:.0f}')
    return scene


if __name__ == '__main__':
    args = sys.argv[1:]
    if '--plan' in args:
        i = args.index('--plan')
        convert(args[0], None, plan_path=None, dump_plan=True)
    else:
        plan = args[2] if len(args) > 2 else None
        convert(args[0], args[1], plan_path=plan)
