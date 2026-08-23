/* Structured hardware/software specs for the tabbed spec panels on /product/.
   Grouped by category; each group feeds specTabs() in templates/blocks.mjs.
   Never name the receiver chip — "u-blox GNSS receiver" only. */

export const specs = {
  rover: {
    performance: [
      ['RTK position accuracy', '0.01 m + 1 ppm CEP'],
      ['PPP position accuracy', '0.10 m CEP'],
      ['Navigation update rate', 'Up to 25 Hz (RTK)'],
      ['RTK convergence', '< 10 sec'],
      ['PPP convergence', '< 120 sec'],
      ['Cold start', '27 sec'],
      ['Aided / reacquisition start', '2 sec'],
      ['Acquisition sensitivity', '−157 dBm (hot start), −160 dBm (reacquisition)'],
    ],
    connectivity: [
      ['Constellations', 'GPS, GLONASS-compatible multi-GNSS, Galileo, BeiDou, QZSS, NavIC, SBAS'],
      ['Bands', 'All major L-band signals across every supported constellation'],
      ['Corrections', 'NTRIP client and caster, RTCM3 in and out'],
      ['Gateway', 'Raspberry Pi Zero 2 W — serial to receiver, WebSocket telemetry to the field app'],
      ['Anti-jamming', 'Continuous-wave interference detection'],
      ['Anti-spoofing', 'Advanced spoofing-detection algorithms'],
    ],
    physical: [
      ['Extended height', '2.00 m to the top of the antenna'],
      ['Collapsed length', 'Roughly a quarter of extended height, for transport'],
      ['Pole', 'Telescoping segments with cam-lock collars'],
      ['Antenna reference', 'Marked ARP datum at the pole top'],
      ['Power', 'Swappable battery module, 4-segment charge indicator'],
      ['Phone mount', 'Flat cradle, screen facing the operator, clear of the collars'],
      ['Antenna', 'Active and passive GNSS antennas supported'],
      ['Environmental rating', 'Not yet certified — production build'],
    ],
  },
  base: {
    performance: [
      ['RTK position accuracy', '0.01 m + 1 ppm CEP'],
      ['Navigation update rate', 'Up to 25 Hz (RTK)'],
      ['Setup', 'Over a known point, or averaged in fix'],
      ['Raw logging', 'Full-session raw observations for PPK'],
    ],
    connectivity: [
      ['Constellations', 'GPS, GLONASS-compatible multi-GNSS, Galileo, BeiDou, QZSS, NavIC, SBAS'],
      ['Corrections out', 'RTCM3 over NTRIP, serial or Wi-Fi'],
      ['Rovers supported', 'Multiple rovers from one base'],
      ['Gateway', 'Raspberry Pi Zero 2 W, same telemetry stack as the rover'],
    ],
    physical: [
      ['Antenna', 'Ground-plane antenna under a sealed radome'],
      ['Mount', 'Survey tripod with levelling tribrach and centring plate'],
      ['Height', '1.44 m at working extension'],
      ['Power', 'Same swappable battery module as the rover'],
    ],
  },
  software: {
    capture: [
      ['Platform', 'Aerom Capture — Android field app'],
      ['Collection', 'RTK/PPK point, line, polygon, and surface/road capture with per-point quality'],
      ['NTRIP client and caster', 'SoI CORS presets, mount-point browser, failover, Aerom Caster publishing'],
      ['Stakeout', 'Point, line, DTM surface, and road/chainage, with live voice guidance'],
      ['COGO tools', 'Inverse, traverse, intersection, resection, point averaging'],
      ['Coordinate systems', 'India CRS catalogue (UTM 42–47N, EPSG:7755), custom Helmert-7, live-telemetry UTM auto-suggest'],
      ['Site calibration', 'GNSS-to-local control-point fit for localized jobs'],
      ['Import / export', 'CSV, DXF, KML, Shapefile, PNEZD, GeoJSON, LandXML, RINEX, and a one-page PDF job report'],
    ],
    studio: [
      ['Platform', 'Aerom Studio — Windows desktop post-processor'],
      ['Headline workflow', 'Kinematic PPK — recovers survey-grade FIX from raw logs when NTRIP drops mid-job'],
      ['Static processing', 'Precise single-coordinate solve, e.g. establishing a base against a CORS'],
      ['Quality readout', 'Fix / Float / Single status, AR ratio, % fix, time-to-first-fix, fix-loss timeline'],
      ['QA/QC report', 'Exportable, defensible PDF with engine version, options, base coordinate, CRS, per-point quality'],
      ['CRS / datum', 'WGS84, UTM 43N + adjacent zones, EPSG:7755, EGM2008 geoid — never silently switched'],
      ['Deliverables', 'POS, PNEZD CSV, general CSV, DXF, KML, SHP, GeoJSON, LandXML'],
    ],
  },
};
