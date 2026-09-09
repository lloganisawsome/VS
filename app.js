"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const els = {
  simClock: $("#simClock"),
  speedButtons: $("#speedButtons"),
  currentPhase: $("#currentPhase"),
  timelineStatus: $("#timelineStatus"),
  phaseEta: $("#phaseEta"),
  phaseTrack: $("#phaseTrack"),
  advancePhase: $("#advancePhase"),
  delayDoors: $("#delayDoors"),
  generateReport: $("#generateReport"),
  attendanceKpi: $("#attendanceKpi"),
  densityKpi: $("#densityKpi"),
  queueKpi: $("#queueKpi"),
  waitKpi: $("#waitKpi"),
  powerKpi: $("#powerKpi"),
  powerWarnKpi: $("#powerWarnKpi"),
  weatherKpi: $("#weatherKpi"),
  weatherWarnKpi: $("#weatherWarnKpi"),
  profitKpi: $("#profitKpi"),
  moneyKpi: $("#moneyKpi"),
  incidentKpi: $("#incidentKpi"),
  criticalKpi: $("#criticalKpi"),
  venueMap: $("#venueMap"),
  sendCrewIn: $("#sendCrewIn"),
  openDock: $("#openDock"),
  callForklift: $("#callForklift"),
  crewBreak: $("#crewBreak"),
  selectedRoomPill: $("#selectedRoomPill"),
  roomTitle: $("#roomTitle"),
  roomDensity: $("#roomDensity"),
  roomInspector: $("#roomInspector"),
  crowdPipeline: $("#crowdPipeline"),
  crowdRates: $("#crowdRates"),
  admissionsPanel: $("#admissionsPanel"),
  admissionsButtons: $("#admissionsButtons"),
  admissionsMeter: $("#admissionsMeter"),
  capacityOverride: $("#capacityOverride"),
  addSecurityLane: $("#addSecurityLane"),
  staffTable: $("#staffTable"),
  calloutStaff: $("#calloutStaff"),
  setupPanel: $("#setupPanel"),
  scenarioButtons: $("#scenarioButtons"),
  bandPill: $("#bandPill"),
  npcPanel: $("#npcPanel"),
  utilityGrid: $("#utilityGrid"),
  panelGrid: $("#panelGrid"),
  backupGrid: $("#backupGrid"),
  shedLobbyLights: $("#shedLobbyLights"),
  addLightingLoad: $("#addLightingLoad"),
  forceUtilityFail: $("#forceUtilityFail"),
  startGenerators: $("#startGenerators"),
  networkTopo: $("#networkTopo"),
  networkStats: $("#networkStats"),
  failCoreA: $("#failCoreA"),
  productionTabs: $("#productionTabs"),
  productionPanel: $("#productionPanel"),
  hvacGrid: $("#hvacGrid"),
  failAhu: $("#failAhu"),
  weatherPanel: $("#weatherPanel"),
  stormButton: $("#stormButton"),
  concessionPanel: $("#concessionPanel"),
  openConcession: $("#openConcession"),
  dispatchFeed: $("#dispatchFeed"),
  incidentPanel: $("#incidentPanel"),
  spawnIncident: $("#spawnIncident"),
  moneyPanel: $("#moneyPanel"),
  scorePanel: $("#scorePanel")
};

const capacity = 8500;
const phaseNames = [
  "DARK", "LOAD-IN", "SETUP", "SOUND CHECK", "DOORS", "OPENER",
  "CHANGEOVER", "HEADLINER", "ENCORE", "EGRESS", "LOAD-OUT", "DARK"
];

const scheduledStarts = [0, 60, 120, 240, 330, 390, 450, 480, 600, 630, 690, 780];
const speeds = [0, 1, 5, 20, 60];
const admissionsModes = ["OPEN", "METERED", "PAUSED", "CLOSED"];
const difficultyModes = ["SANDBOX", "HARD"];
const staffRates = {
  Security: 31,
  Ushers: 24,
  "Guest Services": 22,
  "Box Office": 23,
  Medical: 38,
  Custodial: 20,
  Production: 42,
  Stagehands: 36,
  Electricians: 45,
  IT: 40,
  Catering: 21
};

const state = {
  speed: 0,
  simMinute: 0,
  phaseIndex: 0,
  timelineDelay: 0,
  timelineStatus: "ON TIME",
  selectedRoomId: "foh",
  selectedProduction: "AUDIO",
  securityLanes: 6,
  difficulty: "SANDBOX",
  scenario: "Normal Concert",
  admissions: {
    mode: "CLOSED",
    meteredMax: 120,
    overrideCapacity: false,
    ticketsSold: 6500,
    projectedAttendance: 6500,
    arrived: 0,
    scanned: 0,
    inside: 0,
    exited: 0,
    turnedAway: 0,
    autoPausedAt: null
  },
  lobbyDecorativeLights: true,
  extraLightingLoad: 0,
  utilityAFailed: false,
  atsTimer: 0,
  coreAFailed: false,
  failoverTimer: 0,
  crewDeployed: false,
  dockDoorsOpen: false,
  forkliftsActive: 0,
  trucksArrived: 0,
  unloadedCases: 0,
  unloadProgress: 0,
  setupProgress: 0,
  strikeProgress: 0,
  crewFatigue: 4,
  breaksGiven: 0,
  breakActive: false,
  breakTimer: 0,
  breakStatus: "WORKING",
  staffIntake: 0,
  guestErrandLoad: 0,
  nextBadGuestId: 1,
  badGuests: [],
  parts: {
    "Door Interlock": 1,
    "Valve Actuator": 2,
    "SFP Module": 2,
    "Breaker Lug": 2,
    "POS Reader": 3,
    "Mic Capsule": 4,
    "Mop Kit": 6,
    "Med Kit": 4
  },
  workOrders: [],
  band: {
    status: "BANDING",
    arrivalProgress: 0,
    instrumentLoad: 0,
    soundcheck: 0,
    location: "Band Room"
  },
  crewTasks: [
    { name: "Event Advance", dept: "PM", phase: "DARK", progress: 100, owner: "Production Manager", status: "DONE" },
    { name: "Warehouse Prep", dept: "Production", phase: "LOAD-IN", progress: 35, owner: "Utility Crew", status: "READY" },
    { name: "Truck Load", dept: "Stagehands", phase: "LOAD-IN", progress: 20, owner: "Dock Lead", status: "READY" },
    { name: "Load-In Cases", dept: "Stagehands", phase: "LOAD-IN", progress: 0, owner: "Forklift Team", status: "WAITING" },
    { name: "Stage Build", dept: "Stage", phase: "SETUP", progress: 0, owner: "Carp Lead", status: "WAITING" },
    { name: "Power Deployment", dept: "Power", phase: "SETUP", progress: 0, owner: "Electricians", status: "WAITING" },
    { name: "Rigging Prep", dept: "Rigging", phase: "SETUP", progress: 0, owner: "Rigger", status: "WAITING" },
    { name: "Lighting Hang/Cable", dept: "Lighting", phase: "SETUP", progress: 0, owner: "LD + L2s", status: "WAITING" },
    { name: "PA + Stage Audio", dept: "Audio", phase: "SETUP", progress: 0, owner: "A1/A2", status: "WAITING" },
    { name: "Video Deployment", dept: "Video", phase: "SETUP", progress: 0, owner: "V1", status: "WAITING" },
    { name: "FOH + Network Build", dept: "IT", phase: "SETUP", progress: 0, owner: "IT + FOH", status: "WAITING" },
    { name: "Patch + System Config", dept: "All", phase: "SETUP", progress: 0, owner: "Department Heads", status: "WAITING" },
    { name: "Band Instrument Load", dept: "Band", phase: "SETUP", progress: 0, owner: "Backline Tech", status: "WAITING" },
    { name: "Line Check", dept: "Audio", phase: "SOUND CHECK", progress: 0, owner: "A2", status: "WAITING" },
    { name: "Band Soundcheck", dept: "Band", phase: "SOUND CHECK", progress: 0, owner: "Band + A1", status: "WAITING" },
    { name: "Lighting / Video Check", dept: "Production", phase: "SOUND CHECK", progress: 0, owner: "LD + V1", status: "WAITING" },
    { name: "Preset", dept: "All", phase: "DOORS", progress: 0, owner: "Stage Manager", status: "WAITING" },
    { name: "Show Call", dept: "All", phase: "OPENER", progress: 0, owner: "Production Manager", status: "WAITING" },
    { name: "Strike", dept: "Stagehands", phase: "LOAD-OUT", progress: 0, owner: "Strike Lead", status: "WAITING" },
    { name: "Truck Pack", dept: "Stagehands", phase: "LOAD-OUT", progress: 0, owner: "Dock Lead", status: "WAITING" },
    { name: "Venue Sweep", dept: "PM", phase: "LOAD-OUT", progress: 0, owner: "Stage Manager", status: "WAITING" }
  ],
  nextIncidentId: 184,
  reportGenerated: false,
  peakAttendance: 0,
  totalWaitMinutes: 0,
  waitSamples: 1,
  criticalCount: 0,
  uptimeMinutes: 0,
  downtimeMinutes: 0,
  phaseActualStarts: Array(phaseNames.length).fill(null),
  crowd: {
    outsideQueue: 0,
    security: 0,
    ticketScan: 0,
    lobby: 0,
    concourse: 0,
    seatsFloor: 0,
    egress: 0,
    exited: 0,
    attendance: 0
  },
  money: {
    revenue: 0,
    tickets: 0,
    concessions: 0,
    merch: 0,
    parking: 0,
    cost: 0,
    staffing: 0,
    power: 0,
    fuel: 0,
    overtime: 0
  },
  weather: {
    temp: 58,
    rain: 0.08,
    wind: 9,
    lightning: 28
  },
  production: {
    soundCheckProgress: 0,
    changeoverProgress: 0,
    danteLatency: 1.4,
    danteLoss: 0,
    rfInterference: false,
    lightingNodeFault: false,
    playbackAFailed: false,
    videoBackupActive: false,
    stageReady: false
  }
};

state.phaseActualStarts[0] = 0;

const rooms = [
  { id: "floor", name: "Floor", group: "Arena Bowl", x: 35, y: 43, w: 22, h: 22, cap: 3000, baseTemp: 69, power: 18, net: "OK", access: "Open", equipment: ["Barricade", "Crowd rails"] },
  { id: "stage", name: "Stage", group: "Arena Bowl", x: 62, y: 43, w: 11, h: 22, cap: 180, baseTemp: 70, power: 72, net: "OK", access: "Crew", equipment: ["Deck", "Motors", "Backline"] },
  { id: "stageLeft", name: "Stage Left", group: "Arena Bowl", x: 62, y: 29, w: 11, h: 11, cap: 80, baseTemp: 70, power: 24, net: "OK", access: "Crew", equipment: ["Audio racks", "Monitor world"] },
  { id: "stageRight", name: "Stage Right", group: "Arena Bowl", x: 62, y: 68, w: 11, h: 11, cap: 80, baseTemp: 70, power: 24, net: "OK", access: "Crew", equipment: ["Lighting racks", "Stage power"] },
  { id: "lowerBowl", name: "Lower Bowl", group: "Arena Bowl", x: 32, y: 22, w: 27, h: 14, cap: 2600, baseTemp: 68, power: 20, net: "OK", access: "Open", equipment: ["Seating", "Aisles"] },
  { id: "upperBowl", name: "Upper Bowl", group: "Arena Bowl", x: 32, y: 72, w: 27, h: 14, cap: 2500, baseTemp: 68, power: 18, net: "OK", access: "Open", equipment: ["Seating", "Vomitories"] },
  { id: "mainLobby", name: "Main Lobby", group: "Public", x: 4, y: 39, w: 15, h: 22, cap: 850, baseTemp: 68, power: 42, net: "OK", access: "Public", equipment: ["Mag lanes", "Ticket scan"] },
  { id: "securityLanes", name: "Security Lanes", group: "Public", x: 4, y: 30, w: 15, h: 6, cap: 520, baseTemp: 66, power: 9, net: "OK", access: "Public", equipment: ["Magnetometers", "Bag tables", "Stanchions"] },
  { id: "vipEntry", name: "VIP Entry", group: "Public", x: 4, y: 21, w: 15, h: 6, cap: 140, baseTemp: 68, power: 7, net: "OK", access: "Credential", equipment: ["Scanner", "Credential desk"] },
  { id: "boxOffice", name: "Box Office", group: "Public", x: 4, y: 13, w: 7, h: 6, cap: 80, baseTemp: 69, power: 10, net: "OK", access: "Public", equipment: ["Ticketing", "Printers"] },
  { id: "merch", name: "Merch", group: "Public", x: 12, y: 13, w: 7, h: 6, cap: 120, baseTemp: 69, power: 8, net: "OK", access: "Public", equipment: ["POS", "Tables"] },
  { id: "westConcourse", name: "West Concourse", group: "Public", x: 22, y: 37, w: 7, h: 30, cap: 900, baseTemp: 68, power: 32, net: "OK", access: "Public", equipment: ["Wayfinding", "POS"] },
  { id: "eastConcourse", name: "East Concourse", group: "Public", x: 76, y: 37, w: 7, h: 30, cap: 900, baseTemp: 68, power: 36, net: "OK", access: "Public", equipment: ["Wayfinding", "POS"] },
  { id: "northConcourse", name: "North Concourse", group: "Public", x: 30, y: 13, w: 43, h: 6, cap: 700, baseTemp: 68, power: 24, net: "OK", access: "Public", equipment: ["Bars", "Restrooms"] },
  { id: "southConcourse", name: "South Concourse", group: "Public", x: 30, y: 89, w: 43, h: 6, cap: 700, baseTemp: 68, power: 24, net: "OK", access: "Public", equipment: ["Bars", "Restrooms"] },
  { id: "vomNorth", name: "North Vomitories", group: "Public", x: 35, y: 37, w: 22, h: 4, cap: 360, baseTemp: 68, power: 6, net: "OK", access: "Public", equipment: ["Aisle lights", "Handrails"] },
  { id: "vomSouth", name: "South Vomitories", group: "Public", x: 35, y: 67, w: 22, h: 4, cap: 360, baseTemp: 68, power: 6, net: "OK", access: "Public", equipment: ["Aisle lights", "Handrails"] },
  { id: "westExit", name: "West Exit Bank", group: "Public", x: 22, y: 70, w: 7, h: 5, cap: 480, baseTemp: 66, power: 7, net: "OK", access: "Public", equipment: ["Exit doors", "Counters"] },
  { id: "eastExit", name: "East Exit Bank", group: "Public", x: 76, y: 70, w: 7, h: 5, cap: 480, baseTemp: 66, power: 7, net: "OK", access: "Public", equipment: ["Exit doors", "Counters"] },
  { id: "restroomsA", name: "Restrooms A", group: "Public", x: 76, y: 13, w: 7, h: 6, cap: 120, baseTemp: 69, power: 6, net: "OK", access: "Public", equipment: ["Fixtures", "Exhaust"] },
  { id: "restroomsB", name: "Restrooms B", group: "Public", x: 84, y: 13, w: 7, h: 6, cap: 120, baseTemp: 69, power: 6, net: "OK", access: "Public", equipment: ["Fixtures", "Exhaust"] },
  { id: "restroomsC", name: "Restrooms C", group: "Public", x: 76, y: 77, w: 7, h: 6, cap: 120, baseTemp: 69, power: 6, net: "OK", access: "Public", equipment: ["Fixtures", "Exhaust"] },
  { id: "restroomsD", name: "Restrooms D", group: "Public", x: 84, y: 77, w: 7, h: 6, cap: 120, baseTemp: 69, power: 6, net: "OK", access: "Public", equipment: ["Fixtures", "Exhaust"] },
  { id: "concessionsA", name: "Concessions A", group: "Public", x: 86, y: 23, w: 11, h: 8, cap: 140, baseTemp: 70, power: 42, net: "OK", access: "Public", equipment: ["POS", "Grills", "Coolers"] },
  { id: "concessionsB", name: "Concessions B", group: "Public", x: 86, y: 45, w: 11, h: 8, cap: 140, baseTemp: 70, power: 42, net: "OK", access: "Public", equipment: ["POS", "Fryers", "Coolers"] },
  { id: "concessionsC", name: "Concessions C", group: "Public", x: 86, y: 67, w: 11, h: 8, cap: 140, baseTemp: 70, power: 42, net: "OK", access: "Public", equipment: ["POS", "Pizza ovens"] },
  { id: "greenRoom", name: "Green Room", group: "Back of House", x: 4, y: 2, w: 9, h: 7, cap: 45, baseTemp: 70, power: 8, net: "OK", access: "Credential", equipment: ["Monitors", "Fridge"] },
  { id: "dressing1", name: "Band Room", group: "Back of House", x: 14, y: 2, w: 8, h: 7, cap: 26, baseTemp: 70, power: 10, net: "OK", access: "Credential", equipment: ["Mirror lights", "Instrument racks", "Practice amp"] },
  { id: "dressing2", name: "Dressing Room 2", group: "Back of House", x: 23, y: 2, w: 8, h: 7, cap: 18, baseTemp: 70, power: 6, net: "OK", access: "Credential", equipment: ["Mirror lights"] },
  { id: "prodOffice", name: "Production Office", group: "Back of House", x: 32, y: 2, w: 11, h: 7, cap: 30, baseTemp: 70, power: 12, net: "OK", access: "Crew", equipment: ["Printers", "Radios"] },
  { id: "catering", name: "Catering / Break Room", group: "Back of House", x: 44, y: 2, w: 10, h: 7, cap: 80, baseTemp: 71, power: 28, net: "OK", access: "Credential", equipment: ["Hot boxes", "Coffee", "Crew tables"] },
  { id: "securityOffice", name: "Security Office", group: "Back of House", x: 55, y: 2, w: 10, h: 7, cap: 22, baseTemp: 69, power: 9, net: "OK", access: "Staff", equipment: ["CCTV", "Radio base"] },
  { id: "medical", name: "Medical", group: "Back of House", x: 66, y: 2, w: 8, h: 7, cap: 18, baseTemp: 69, power: 10, net: "OK", access: "Staff", equipment: ["AED", "Beds"] },
  { id: "storage", name: "Storage", group: "Back of House", x: 75, y: 2, w: 8, h: 7, cap: 25, baseTemp: 67, power: 4, net: "OK", access: "Crew", equipment: ["Road cases"] },
  { id: "riggingLoft", name: "Rigging Loft", group: "Back of House", x: 84, y: 2, w: 10, h: 7, cap: 24, baseTemp: 74, power: 10, net: "OK", access: "Crew", equipment: ["Motor control", "Fall arrest"] },
  { id: "loadingDock", name: "Loading Dock", group: "Operations", x: 4, y: 72, w: 12, h: 9, cap: 120, baseTemp: 63, power: 14, net: "OK", access: "Crew", equipment: ["Dock doors", "Forklifts"] },
  { id: "truckLot", name: "Truck Lot", group: "Operations", x: 4, y: 84, w: 12, h: 13, cap: 260, baseTemp: 58, power: 3, net: "OK", access: "Crew", equipment: ["Trucks", "Barricade"] },
  { id: "busBay", name: "Bus Bay", group: "Operations", x: 17, y: 84, w: 10, h: 13, cap: 75, baseTemp: 58, power: 4, net: "OK", access: "Crew", equipment: ["Shore power", "Barricade"] },
  { id: "freightElevator", name: "Freight Elevator", group: "Operations", x: 17, y: 72, w: 4.5, h: 9, cap: 18, baseTemp: 64, power: 16, net: "OK", access: "Crew", equipment: ["Lift gate", "Radio call box"] },
  { id: "northGarage", name: "North Garage", group: "Operations", x: 29, y: 96, w: 15, h: 3.3, cap: 180, baseTemp: 56, power: 5, net: "DEGRADED", access: "Staff", equipment: ["Level P2", "Elevator bank"] },
  { id: "southGarage", name: "South Garage", group: "Operations", x: 46, y: 96, w: 15, h: 3.3, cap: 220, baseTemp: 57, power: 5, net: "DEGRADED", access: "Public", equipment: ["Ride share", "Garage exits"] },
  { id: "serviceTunnel", name: "Service Tunnel", group: "Operations", x: 83.2, y: 37, w: 2.4, h: 32, cap: 90, baseTemp: 65, power: 8, net: "OK", access: "Crew", equipment: ["Cable trays", "Pipe chase"] },
  { id: "mainElectrical", name: "Main Electrical", group: "Operations", x: 86, y: 35, w: 11, h: 8, cap: 8, baseTemp: 73, power: 2, net: "OK", access: "Locked", equipment: ["Switchgear", "ATS"] },
  { id: "generatorYard", name: "Generator Yard", group: "Operations", x: 86, y: 55, w: 11, h: 8, cap: 12, baseTemp: 58, power: 1, net: "OK", access: "Locked", equipment: ["Gen 1", "Gen 2"] },
  { id: "hvacPlant", name: "HVAC Plant", group: "Operations", x: 86, y: 87, w: 11, h: 10, cap: 12, baseTemp: 76, power: 70, net: "OK", access: "Locked", equipment: ["Chillers", "Pumps"] },
  { id: "mdf", name: "MDF", group: "Operations", x: 92, y: 13, w: 5, h: 6, cap: 6, baseTemp: 66, power: 12, net: "OK", access: "Locked", equipment: ["CORE-SW-A", "CORE-SW-B"] },
  { id: "idfA", name: "IDF A", group: "Operations", x: 76, y: 21, w: 7, h: 6, cap: 4, baseTemp: 67, power: 6, net: "OK", access: "Locked", equipment: ["IDF-EAST-01"] },
  { id: "idfB", name: "IDF B", group: "Operations", x: 76, y: 83, w: 7, h: 5, cap: 4, baseTemp: 67, power: 6, net: "OK", access: "Locked", equipment: ["IDF-WEST-01"] },
  { id: "foh", name: "FOH", group: "Operations", x: 42, y: 54, w: 8, h: 8, cap: 24, baseTemp: 70, power: 18, net: "OK", access: "Crew", equipment: ["Audio console", "Lighting console", "Video control"] }
];

const roomRuntime = new Map(rooms.map((room) => [room.id, {
  occupancy: 0,
  temp: room.baseTemp,
  incidents: [],
  network: "OK",
  power: room.power
}]));

const staff = {
  Security: { scheduled: 52, checkedIn: 47, assigned: 44 },
  Ushers: { scheduled: 38, checkedIn: 36, assigned: 31 },
  "Guest Services": { scheduled: 24, checkedIn: 22, assigned: 18 },
  "Box Office": { scheduled: 12, checkedIn: 11, assigned: 9 },
  Medical: { scheduled: 8, checkedIn: 8, assigned: 6 },
  Custodial: { scheduled: 18, checkedIn: 17, assigned: 12 },
  Production: { scheduled: 28, checkedIn: 27, assigned: 22 },
  Stagehands: { scheduled: 36, checkedIn: 33, assigned: 30 },
  Electricians: { scheduled: 10, checkedIn: 9, assigned: 7 },
  IT: { scheduled: 9, checkedIn: 8, assigned: 6 },
  Catering: { scheduled: 16, checkedIn: 14, assigned: 12 }
};

const scenarioPresets = [
  { name: "Normal Concert", tickets: 6500, security: 52, guestServices: 24, boxOffice: 12, weather: { rain: 0.08, wind: 9, lightning: 28 }, note: "Balanced crowd, normal production." },
  { name: "Sold Out", tickets: 8500, security: 56, guestServices: 28, boxOffice: 14, weather: { rain: 0.12, wind: 11, lightning: 24 }, note: "Capacity crowd with heavy arrivals." },
  { name: "Overbooked", tickets: 9100, security: 54, guestServices: 26, boxOffice: 13, weather: { rain: 0.16, wind: 12, lightning: 22 }, note: "Oversold by design. Capacity interlock matters." },
  { name: "Understaffed", tickets: 7600, security: 28, guestServices: 15, boxOffice: 8, weather: { rain: 0.1, wind: 10, lightning: 25 }, note: "Entry throughput starts in trouble." },
  { name: "Storm Night", tickets: 8000, security: 50, guestServices: 26, boxOffice: 12, weather: { rain: 0.78, wind: 31, lightning: 7.5 }, note: "Weather slows arrivals and stresses queues." },
  { name: "Ancient Venue", tickets: 7200, security: 48, guestServices: 22, boxOffice: 11, weather: { rain: 0.22, wind: 13, lightning: 19 }, note: "Facility failures are more likely." }
];

const panels = [
  { name: "House Lighting", kw: 32, max: 70, critical: false },
  { name: "HVAC", kw: 86, max: 150, critical: true },
  { name: "Concessions", kw: 68, max: 110, critical: false },
  { name: "Production A", kw: 108, max: 180, critical: true },
  { name: "Production B", kw: 94, max: 160, critical: true },
  { name: "Stage Motors", kw: 22, max: 85, critical: true },
  { name: "FOH", kw: 18, max: 45, critical: true },
  { name: "Video", kw: 52, max: 100, critical: true },
  { name: "Audio", kw: 44, max: 95, critical: true },
  { name: "Emergency", kw: 15, max: 65, critical: true }
];

const utilities = {
  A: { online: true, voltage: 208, pf: 0.93, l1: 290, l2: 282, l3: 301 },
  B: { online: true, voltage: 208, pf: 0.91, l1: 116, l2: 123, l3: 119 }
};

const backup = {
  gen1: { label: "Generator 1", state: "OFF", timer: 0, fuel: 91 },
  gen2: { label: "Generator 2", state: "OFF", timer: 0, fuel: 88 },
  upsA: { label: "UPS A", charge: 94, load: 31, runtime: 36.2 },
  upsB: { label: "UPS B", charge: 97, load: 22, runtime: 52.4 }
};

const switches = [
  { name: "CORE-SW-A", role: "Primary", speed: "10G", loss: 0, latency: 1.2, bandwidth: 42, clients: 122, cpu: 28, temp: 101, online: true },
  { name: "CORE-SW-B", role: "Standby", speed: "10G", loss: 0, latency: 1.3, bandwidth: 31, clients: 84, cpu: 22, temp: 98, online: true },
  { name: "FOH-SW-01", role: "Access", speed: "1G", loss: 0, latency: 1.8, bandwidth: 58, clients: 36, cpu: 37, temp: 96, online: true },
  { name: "STAGE-SW-01", role: "Access", speed: "1G", loss: 0, latency: 1.6, bandwidth: 67, clients: 54, cpu: 42, temp: 99, online: true },
  { name: "IDF-EAST-01", role: "Access", speed: "1G", loss: 0, latency: 2.0, bandwidth: 49, clients: 214, cpu: 34, temp: 94, online: true },
  { name: "IDF-WEST-01", role: "Access", speed: "1G", loss: 0, latency: 2.1, bandwidth: 46, clients: 198, cpu: 31, temp: 93, online: true }
];

const concessions = {
  openStands: 5,
  staff: 24,
  waiting: 0,
  avgService: 42,
  pos: "ONLINE",
  inventory: {
    Water: 1482,
    Soda: 2841,
    "Hot Dogs": 716,
    Pizza: 483
  }
};

const hvac = [
  { name: "AHU-1 Arena Bowl", supply: 55, ret: 70, fan: 62, cooling: 44, static: 1.6, filter: "GOOD", online: true },
  { name: "AHU-2 Concourse", supply: 56, ret: 69, fan: 58, cooling: 38, static: 1.4, filter: "GOOD", online: true },
  { name: "AHU-3 Backstage", supply: 57, ret: 70, fan: 48, cooling: 29, static: 1.2, filter: "FAIR", online: true }
];

let incidents = [];
let dispatch = [];
let lastFrame = performance.now();
let renderAccumulator = 0;
let uiRenderAccumulator = 0;
let incidentAccumulator = 0;
let dispatchAccumulator = 0;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fmtMoney(value) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtNumber(value) {
  return Math.round(value).toLocaleString("en-US");
}

function formatSimTime(minute) {
  const total = Math.max(0, Math.floor(minute));
  const hours = Math.floor(total / 60) + 8;
  const mins = total % 60;
  return `${String(hours % 24).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function phase() {
  return phaseNames[state.phaseIndex];
}

function effectiveStart(index) {
  return scheduledStarts[index] + state.timelineDelay;
}

function currentDelayMinutes() {
  const currentStart = state.phaseActualStarts[state.phaseIndex] ?? state.simMinute;
  return Math.round(currentStart - scheduledStarts[state.phaseIndex]);
}

function classifyTimeline() {
  const nextScheduled = scheduledStarts[state.phaseIndex + 1];
  if (nextScheduled !== undefined && state.simMinute > nextScheduled + 6 && !phaseReadyForAutoAdvance()) {
    return "DELAYED";
  }
  const delay = currentDelayMinutes();
  if (delay <= -6) return "EARLY";
  if (delay >= 6) return "DELAYED";
  return "ON TIME";
}

function densityFrom(occupancy, room) {
  const ratio = room.cap ? occupancy / room.cap : 0;
  if (ratio > 1) return "OVERCAPACITY";
  if (ratio > 0.72) return "HIGH";
  if (ratio > 0.34) return "MODERATE";
  return "LOW";
}

function cssDensity(text) {
  return text.toLowerCase().replace(/\s+/g, "");
}

function flash(el) {
  if (!el) return;
  el.classList.remove("flash");
  void el.offsetWidth;
  el.classList.add("flash");
}

function addDispatch(from, message) {
  const line = { time: formatSimTime(state.simMinute), from, message };
  dispatch.unshift(line);
  dispatch = dispatch.slice(0, 32);
}

function createIncident(category, severity, title, source, cascade = [], playbook = null) {
  const existing = incidents.find((incident) => incident.title === title && incident.status !== "RESOLVED");
  if (existing) return existing;
  const runbook = playbook || inferIncidentPlaybook(category, title, source);
  const incident = {
    id: `INC-${String(state.nextIncidentId++).padStart(4, "0")}`,
    category,
    severity,
    title,
    source,
    cascade,
    detail: incidentDetail(category, title, source),
    steps: incidentSteps(category, title),
    why: runbook.why,
    fix: runbook.fix,
    impact: runbook.impact,
    mitigated: false,
    status: "NEW",
    assigned: "Unassigned",
    openedAt: formatSimTime(state.simMinute),
    resolvedAt: null
  };
  incidents.unshift(incident);
  if (severity === "CRITICAL") state.criticalCount += 1;
  addDispatch("CONTROL", `${incident.id} opened: ${title}`);
  const room = rooms.find((item) => item.name === source || item.id === source);
  if (room) roomRuntime.get(room.id).incidents.push(incident.id);
  return incident;
}

function incidentDetail(category, title, source) {
  const p = phase();
  const location = rooms.find((room) => room.name === source || room.id === source);
  const density = location ? densityFrom(roomRuntime.get(location.id).occupancy, location) : "UNKNOWN";
  const lower = title.toLowerCase();
  if (lower.includes("disorderly") || lower.includes("guest escort")) {
    return `A guest behavior flag is active in ${source}. Security should make contact, separate the guest from the crowd, and move them through the nearest exit bank. Current area density: ${density}.`;
  }
  if (lower.includes("queue")) {
    return `Entry demand is outrunning screening. Current security lanes: ${state.securityLanes}; outside queue: ${fmtNumber(state.crowd.outsideQueue)}. Add lanes or move staff before the delay cascades.`;
  }
  if (lower.includes("capacity")) {
    return `Admissions is at ${((state.admissions.inside / capacity) * 100).toFixed(1)}% of legal capacity. Scanners are interlocked unless override is on; excess ticket holders should be metered or turned away.`;
  }
  if (lower.includes("concessions")) {
    return `The stand queue is growing faster than service capacity. Open stands: ${concessions.openStands}; waiting guests: ${fmtNumber(concessions.waiting)}. POS and line control are the fastest fixes.`;
  }
  if (lower.includes("ahu") || category === "HVAC") {
    return `HVAC readings are drifting during ${p}. Dispatch a tech to the plant, verify supply fan, chilled-water valve, filters, and reset state before comfort falls.`;
  }
  if (lower.includes("panel") || lower.includes("phase") || category === "Electrical") {
    return `Electrical load is outside the comfort band. Send electricians to Main Electrical, check distro balance, shed noncritical loads, then re-meter before show load increases.`;
  }
  if (lower.includes("core") || lower.includes("dante") || category === "Network") {
    return `Network telemetry shows production traffic risk. IT should verify redundant path, reseat or reboot the affected switch, and keep Dante/POS away from congested links.`;
  }
  if (category === "Medical") {
    return `Medical assist requires a clear path from Medical to ${source}. Security/ushers should hold a route while medical evaluates and transports if needed.`;
  }
  if (category === "Facility") {
    return `Facility issue at ${source}. Send custodial or operations staff with supplies, clear the immediate area, and confirm the space is usable before reopening flow.`;
  }
  return `${category} issue reported at ${source} during ${p}. Assign the recommended staff, watch the work order progress, then resolve after the local condition clears.`;
}

function incidentSteps(category, title) {
  const lower = title.toLowerCase();
  if (lower.includes("disorderly") || lower.includes("guest escort")) return ["Contact guest", "Separate from crowd", "Escort to exit", "Backfill area"];
  if (lower.includes("queue")) return ["Open lane", "Move stanchions", "Assign screeners", "Watch wait time"];
  if (lower.includes("capacity")) return ["Freeze scan", "Verify count", "Meter doors", "Turn away excess"];
  if (lower.includes("concessions")) return ["Send POS staff", "Open stand", "Restock counter", "Split line"];
  if (lower.includes("ahu") || category === "HVAC") return ["Grab tool kit", "Open chilled-water valve", "Reset AHU", "Verify supply temp"];
  if (lower.includes("panel") || lower.includes("phase") || category === "Electrical") return ["Meter phases", "Shed load", "Rebalance circuits", "Thermal check"];
  if (lower.includes("core") || lower.includes("dante") || category === "Network") return ["Patch to backup", "Check switch", "Reduce traffic", "Confirm latency"];
  if (category === "Medical") return ["Clear route", "Assess guest", "Treat/transport", "Reopen section"];
  if (category === "Facility") return ["Get supplies", "Block area", "Clean/fix", "Release area"];
  return ["Acknowledge", "Assign staff", "Mitigate", "Resolve"];
}

function incidentById(id) {
  return incidents.find((incident) => incident.id === id);
}

function setIncidentStatus(id, status) {
  const incident = incidentById(id);
  if (!incident) return;
  incident.status = status;
  if (status === "ASSIGNED") {
    incident.assigned = suggestCrewFor(incident.category);
    startWorkOrder(incident);
  }
  if (status === "MITIGATING") {
    incident.assigned = incident.assigned === "Unassigned" ? suggestCrewFor(incident.category) : incident.assigned;
    startWorkOrder(incident);
    applyMitigation(incident);
  }
  if (status === "RESOLVED") {
    incident.resolvedAt = formatSimTime(state.simMinute);
    if (incident.title.includes("CORE-SW-A")) {
      state.coreAFailed = false;
      switches[0].online = true;
      switches[0].role = "Primary";
      switches[1].role = "Standby";
      state.failoverTimer = 0;
    }
  }
  addDispatch("CONTROL", `${id} ${status}`);
  renderAll();
}

function startWorkOrder(incident) {
  if (state.workOrders.some((order) => order.incidentId === incident.id && order.status !== "DONE")) return;
  const crew = incident.assigned === "Unassigned" ? suggestCrewFor(incident.category) : incident.assigned;
  const destination = rooms.find((room) => room.name === incident.source || room.id === incident.source) || rooms.find((room) => room.id === "foh");
  const duration = incident.severity === "CRITICAL" ? 10 : incident.severity === "WARNING" ? 7 : 4;
  const repair = repairNeedForIncident(incident);
  state.workOrders.push({
    incidentId: incident.id,
    crew,
    destinationId: destination.id,
    tool: repair.tool,
    part: repair.part,
    partAcquired: !repair.part,
    blockTimer: 0,
    progress: 0,
    duration,
    status: "EN ROUTE"
  });
  if (staff[crew]) staff[crew].assigned = Math.min(staff[crew].checkedIn, staff[crew].assigned + 1);
  addDispatch(crew.toUpperCase(), `Unit assigned to ${incident.id}; walking to ${destination.name} with ${repair.tool}${repair.part ? `, needs ${repair.part}` : ""}.`);
}

function updateWorkOrders(dt) {
  state.workOrders.forEach((order) => {
    if (order.status === "DONE") return;
    if (order.status === "PART BLOCKED") {
      order.blockTimer += dt;
      if (order.blockTimer > 3) {
        state.parts[order.part] = Math.max(0, (state.parts[order.part] || 0) + 1);
        order.partAcquired = true;
        order.status = "GETTING KIT";
        addDispatch("STORAGE", `${order.part} found in road case. Runner returning to repair.`);
      } else {
        return;
      }
    }
    order.progress = clamp(order.progress + dt / order.duration * 100, 0, 100);
    const previousStatus = order.status;
    if (order.progress < 24) {
      order.status = "EN ROUTE";
    } else if (order.progress < 46) {
      order.status = "GETTING KIT";
    } else if (order.progress < 84) {
      order.status = "FIXING";
    } else if (order.progress < 100) {
      order.status = "TESTING";
    }
    if (order.progress > 24 && previousStatus === "EN ROUTE") {
      const incident = incidentById(order.incidentId);
      if (incident) {
        incident.status = "MITIGATING";
        addDispatch(order.crew.toUpperCase(), `${order.incidentId} reached ${incident.source}. ${workOrderAction(order)}.`);
      }
    }
    if (order.progress >= 46 && order.part && !order.partAcquired) {
      if ((state.parts[order.part] || 0) > 0) {
        state.parts[order.part] -= 1;
        order.partAcquired = true;
        addDispatch("STORAGE", `${order.part} issued for ${order.incidentId}.`);
      } else {
        order.status = "PART BLOCKED";
        order.blockTimer = 0;
        const incident = incidentById(order.incidentId);
        if (incident) {
          incident.status = "MITIGATING";
          incident.detail = `${incident.detail} Repair is blocked because ${order.part} is not on the cart. A runner is searching Storage.`;
        }
        addDispatch(order.crew.toUpperCase(), `${order.incidentId}: repair blocked, ${order.part} required.`);
        return;
      }
    }
    if (previousStatus !== order.status && order.status !== "DONE" && order.status !== "EN ROUTE") {
      addDispatch(order.crew.toUpperCase(), `${order.incidentId}: ${workOrderAction(order)}.`);
    }
    if (order.progress >= 100) {
      order.status = "DONE";
      order.doneAt = state.simMinute;
      const incident = incidentById(order.incidentId);
      if (incident && incident.status !== "RESOLVED") {
        applyMitigation(incident);
        incident.status = "RESOLVED";
        incident.resolvedAt = formatSimTime(state.simMinute);
        addDispatch(order.crew.toUpperCase(), `${order.incidentId} fixed and cleared.`);
      }
    }
  });
  state.workOrders = state.workOrders.filter((order) => order.status !== "DONE" || state.simMinute - (order.doneAt || 0) < 5);
}

function repairNeedForIncident(incident) {
  const lower = incident.title.toLowerCase();
  if (lower.includes("freight elevator")) return { tool: "Electrical Kit", part: "Door Interlock" };
  if (lower.includes("ahu") || incident.category === "HVAC") return { tool: "HVAC Bag", part: "Valve Actuator" };
  if (lower.includes("core") || lower.includes("dante") || incident.category === "Network") return { tool: "Patch Kit", part: "SFP Module" };
  if (lower.includes("panel") || lower.includes("phase") || incident.category === "Electrical") return { tool: "Meter + PPE", part: "Breaker Lug" };
  if (lower.includes("concessions") || lower.includes("pos")) return { tool: "POS Drawer", part: "POS Reader" };
  if (lower.includes("rf")) return { tool: "RF Scanner", part: "Mic Capsule" };
  if (incident.category === "Medical") return { tool: "Med Bag", part: "Med Kit" };
  if (incident.category === "Facility") return { tool: "Facility Cart", part: "Mop Kit" };
  return { tool: "Radio + Tool Pouch", part: null };
}

function workOrderAction(order) {
  const incident = incidentById(order.incidentId);
  const title = incident?.title.toLowerCase() || "";
  const category = incident?.category || "";
  if (order.status === "EN ROUTE") return "walking route";
  if (order.status === "PART BLOCKED") return `${order.part} missing; runner searching storage`;
  if (title.includes("disorderly") || title.includes("guest escort")) {
    if (order.status === "GETTING KIT") return "calling second unit and clearing path";
    if (order.status === "FIXING") return "escorting guest to exit bank";
    return "confirming area is calm";
  }
  if (title.includes("queue")) {
    if (order.status === "GETTING KIT") return "grabbing mag tables and stanchions";
    if (order.status === "FIXING") return "opening another screening lane";
    return "watching wait time drop";
  }
  if (title.includes("concessions")) {
    if (order.status === "GETTING KIT") return "getting POS drawer and stock tubs";
    if (order.status === "FIXING") return "opening stand and splitting line";
    return "checking service time";
  }
  if (title.includes("ahu") || category === "HVAC") {
    if (order.status === "GETTING KIT") return "getting ladder, filter, and valve key";
    if (order.status === "FIXING") return "opening chilled-water valve and resetting AHU";
    return "verifying supply temperature";
  }
  if (title.includes("panel") || title.includes("phase") || category === "Electrical") {
    if (order.status === "GETTING KIT") return "getting meter and PPE";
    if (order.status === "FIXING") return "shedding load and rebalancing phases";
    return "thermal check on distro";
  }
  if (title.includes("core") || title.includes("dante") || category === "Network") {
    if (order.status === "GETTING KIT") return "getting patch kit and console cable";
    if (order.status === "FIXING") return "moving traffic to backup path";
    return "checking latency and packet loss";
  }
  if (category === "Medical") {
    if (order.status === "GETTING KIT") return "getting med bag and chair";
    if (order.status === "FIXING") return "treating guest and clearing route";
    return "closing medical note";
  }
  if (category === "Facility") {
    if (order.status === "GETTING KIT") return "getting cones, mop, and supplies";
    if (order.status === "FIXING") return "cleaning and reopening the area";
    return "checking floor is dry and clear";
  }
  if (order.status === "GETTING KIT") return "getting tools and parts";
  if (order.status === "FIXING") return "repairing local system";
  return "verifying normal operation";
}

function inferIncidentPlaybook(category, title, source) {
  const lower = title.toLowerCase();
  if (lower.includes("core-sw-a")) {
    return {
      why: "Primary core switch stopped forwarding, so redundant paths are reconverging and production VLANs see loss.",
      impact: "Dante, lighting, POS, staff devices, and guest Wi-Fi all ride degraded paths until Core B stabilizes.",
      fix: "Confirm Core B gateway role, isolate CORE-SW-A, move Dante to secondary, then dispatch IT to MDF for switch reboot/reseat."
    };
  }
  if (lower.includes("panel overload")) {
    return {
      why: "Production load exceeded panel headroom, usually from added lighting/video draw during show state.",
      impact: "Breaker trip risk; audio, video, and lighting reliability score will fall if it stays hot.",
      fix: "Shed noncritical lighting, split fixtures across Production B, and send electricians to Main Electrical."
    };
  }
  if (lower.includes("phase imbalance")) {
    return {
      why: "One phase is carrying much more current than the others after a lighting or motor load change.",
      impact: "Heat, nuisance trips, and unstable distro voltage can appear under headliner load.",
      fix: "Move part of the lighting load to the low phase or shed decorative/nonessential circuits."
    };
  }
  if (lower.includes("queue")) {
    return {
      why: "Arrival rate is higher than security throughput, often from missing guards, rain, or too few lanes.",
      impact: "Wait time rises, exterior density increases, and doors/headliner delays become more likely.",
      fix: "Open another security lane, reassign guest services to entry, and dispatch security to the main entrance."
    };
  }
  if (lower.includes("capacity")) {
    return {
      why: "Admissions reached a legal capacity threshold while guests were still arriving or waiting to scan.",
      impact: "Scanners stop, queue pressure moves upstream, and any operator override creates safety and compliance risk.",
      fix: "Meter or pause admissions, confirm inside count versus exits, turn away excess arrivals, and only override if command accepts the risk."
    };
  }
  if (lower.includes("disorderly") || lower.includes("guest escort")) {
    return {
      why: "A guest behavior flag tripped after simulated crowd friction, alcohol sales, or seating conflict in a public area.",
      impact: "Nearby density tightens, security response time is consumed, and guest experience drops if the escort stalls.",
      fix: "Assign Security, keep the guest moving to the nearest exit bank, and backfill the area with Guest Services."
    };
  }
  if (lower.includes("concessions")) {
    return {
      why: "Changeover demand hit concessions faster than open stands and POS staff can serve.",
      impact: "Concourse density and guest frustration climb; sales may be lost if the line stays long.",
      fix: "Open an extra stand, assign POS staff, and route guest services to line control."
    };
  }
  if (lower.includes("dante")) {
    return {
      why: "Audio network latency or packet loss crossed a safe threshold on the stage/FOH path.",
      impact: "Stage racks can show clock warnings and audio redundancy becomes important.",
      fix: "Move traffic to Dante secondary, reduce guest Wi-Fi/POS load on shared links, and check STAGE-SW-01."
    };
  }
  if (lower.includes("ahu") || category === "HVAC") {
    return {
      why: "Air handler capacity is unavailable or cooling demand has outrun current supply.",
      impact: "Occupied areas warm gradually, not instantly, so guest comfort keeps degrading until airflow returns.",
      fix: "Dispatch electricians/HVAC to the plant, bring another AHU online, and reduce door-open time."
    };
  }
  if (lower.includes("playback")) {
    return {
      why: "Primary playback path failed, so the video switcher moved program to the backup machine.",
      impact: "Show continues, but redundancy is gone until Playback A is restored.",
      fix: "Keep Playback B on program, reboot Playback A, resync media, then return it to hot standby."
    };
  }
  if (lower.includes("rf")) {
    return {
      why: "RF noise floor jumped or a nearby frequency is colliding with the vocal channel.",
      impact: "Dropouts may occur on wireless microphones until the channel is coordinated.",
      fix: "Scan RF, retune the affected pack, replace battery if weak, and hand artist a spare mic."
    };
  }
  if (category === "Staffing") {
    return {
      why: "Checked-in staff is below scheduled count or a team was reassigned away from coverage.",
      impact: "Throughput, response time, or setup progress slows depending on the missing department.",
      fix: "Reassign available staff, call a floater, or reduce service points until coverage recovers."
    };
  }
  if (category === "Weather") {
    return {
      why: "External conditions crossed an operational threshold for queues, dock doors, or guest comfort.",
      impact: "Arrivals slow, outdoor density becomes riskier, and load-in/load-out may need supervision.",
      fix: "Move queues under cover, slow dock traffic, and dispatch security/guest services to weather watch."
    };
  }
  return {
    why: `${category} telemetry at ${source} crossed a simulated operating threshold.`,
    impact: "The affected department loses margin until a crew acknowledges and mitigates the issue.",
    fix: `Assign ${suggestCrewFor(category)}, verify the local system state, and resolve once readings normalize.`
  };
}

function applyMitigation(incident) {
  if (incident.mitigated) return;
  incident.mitigated = true;
  const lower = incident.title.toLowerCase();
  if (lower.includes("queue")) {
    state.securityLanes += 1;
    staff.Security.assigned = Math.min(staff.Security.checkedIn, staff.Security.assigned + 2);
    state.money.cost += 650;
    addDispatch("SECURITY", "Mitigation applied: extra entry lane opened and two units moved to doors.");
  } else if (lower.includes("capacity")) {
    state.admissions.mode = "METERED";
    state.admissions.meteredMax = Math.min(state.admissions.meteredMax, 45);
    if (state.admissions.inside >= capacity && !state.admissions.overrideCapacity) state.admissions.mode = "PAUSED";
    state.admissions.turnedAway += Math.min(state.crowd.outsideQueue, 80);
    state.crowd.outsideQueue = Math.max(0, state.crowd.outsideQueue - 80);
    addDispatch("ADMISSIONS", "Mitigation applied: scanners metered, count verified, excess arrivals redirected.");
  } else if (lower.includes("disorderly") || lower.includes("guest escort")) {
    state.badGuests.forEach((guest) => {
      if (guest.incidentId === incident.id) guest.progress = Math.max(guest.progress, 82);
    });
    staff.Security.assigned = Math.min(staff.Security.checkedIn, staff.Security.assigned + 1);
    state.money.cost += 120;
    addDispatch("SECURITY", "Mitigation applied: escort team has control and is moving the guest to an exit bank.");
  } else if (lower.includes("concessions")) {
    concessions.openStands += 1;
    concessions.staff += 3;
    state.money.cost += 420;
    addDispatch("CONCESSIONS", "Mitigation applied: extra stand and POS staff opened.");
  } else if (lower.includes("panel overload") || lower.includes("phase imbalance")) {
    state.extraLightingLoad = Math.max(0, state.extraLightingLoad - 18);
    state.lobbyDecorativeLights = false;
    addDispatch("ELECTRICAL", "Mitigation applied: shed lobby lights and reduced added production load.");
  } else if (lower.includes("core-sw-a")) {
    state.coreAFailed = false;
    switches[0].online = true;
    switches[0].role = "Primary";
    switches[1].role = "Standby";
    state.failoverTimer = 3;
    addDispatch("IT", "Mitigation applied: Core B forced gateway; production VLANs stabilized on backup path.");
  } else if (lower.includes("dante")) {
    state.production.danteLatency = Math.max(1.8, state.production.danteLatency - 3);
    state.production.danteLoss = Math.max(0, state.production.danteLoss - 0.5);
    addDispatch("AUDIO", "Mitigation applied: Dante secondary preferred and stage switch traffic reduced.");
  } else if (lower.includes("ahu") || incident.category === "HVAC") {
    const failed = hvac.find((ahu) => !ahu.online);
    if (failed) failed.online = true;
    hvac.forEach((ahu) => {
      ahu.cooling = Math.min(100, ahu.cooling + 12);
      ahu.fan = Math.min(100, ahu.fan + 10);
    });
    addDispatch("HVAC", "Mitigation applied: AHU recovery attempted and cooling demand raised.");
  } else if (lower.includes("playback")) {
    state.production.playbackAFailed = false;
    state.production.videoBackupActive = true;
    addDispatch("VIDEO", "Mitigation applied: Playback B locked as program source.");
  } else if (lower.includes("rf")) {
    state.production.rfInterference = false;
    addDispatch("AUDIO", "Mitigation applied: RF channel retuned and spare pack staged.");
  } else if (lower.includes("lighting node")) {
    state.production.lightingNodeFault = false;
    addDispatch("LIGHTING", "Mitigation applied: failed node replaced and universes restored.");
  } else {
    addDispatch(incident.assigned.toUpperCase(), `Mitigation started for ${incident.id}: ${incident.fix}`);
  }
}

function suggestCrewFor(category) {
  return {
    Electrical: "Electricians",
    Network: "IT",
    Production: "Production",
    Crowd: "Guest Services",
    Security: "Security",
    Medical: "Medical",
    HVAC: "Electricians",
    "Fire/Life Safety": "Security",
    Staffing: "Guest Services",
    Weather: "Operations",
    Facility: "Custodial"
  }[category] || "Operations";
}

function moveFlow(from, to, maxAmount) {
  const amount = Math.min(state.crowd[from], Math.max(0, maxAmount));
  state.crowd[from] -= amount;
  state.crowd[to] += amount;
  return amount;
}

function staffingCoverage(name) {
  const group = staff[name];
  if (!group) return 1;
  return clamp(group.assigned / Math.max(1, group.scheduled), 0.35, 1.25);
}

function phaseArrivalRate() {
  const p = phase();
  const base = {
    "DARK": 0,
    "LOAD-IN": 0,
    "SETUP": 0,
    "SOUND CHECK": 3,
    "DOORS": 112,
    "OPENER": 55,
    "CHANGEOVER": 12,
    "HEADLINER": 5,
    "ENCORE": 0,
    "EGRESS": 0,
    "LOAD-OUT": 0
  }[p] || 0;
  const ticketPressure = clamp(state.admissions.ticketsSold / capacity, 0.55, 1.18);
  const scenarioBoost = state.scenario === "Sold Out" ? 1.28 : state.scenario === "Overbooked" ? 1.45 : state.scenario === "Storm Night" ? 0.9 : 1;
  const rainFactor = 1 - state.weather.rain * 0.34;
  const lightningFactor = state.weather.lightning < 8 ? 0.7 : 1;
  return base * ticketPressure * scenarioBoost * rainFactor * lightningFactor;
}

function updateCrowd(dt) {
  const p = phase();
  const remainingTickets = Math.max(0, state.admissions.ticketsSold - state.admissions.arrived);
  const arrivals = Math.min(phaseArrivalRate() * dt, remainingTickets);
  state.admissions.arrived += arrivals;
  state.crowd.outsideQueue += arrivals;

  const securityStaffFactor = staffingCoverage("Security") * (staff.Security.checkedIn / staff.Security.scheduled);
  const securityThroughput = (state.securityLanes * 16) * securityStaffFactor;
  const baseScanThroughput = 140 * staffingCoverage("Box Office");
  const admissions = state.admissions;
  const capacityRemaining = admissions.overrideCapacity ? Math.max(0, admissions.ticketsSold - admissions.inside - admissions.exited) : Math.max(0, capacity - admissions.inside);
  const admissionsOpen = admissions.mode !== "CLOSED";
  const scanOpen = admissions.mode === "OPEN" || admissions.mode === "METERED";
  const meteredCap = admissions.mode === "METERED" ? admissions.meteredMax : Infinity;
  const interlockPaused = capacityRemaining <= 0 && !admissions.overrideCapacity;
  let scanThroughput = scanOpen && !interlockPaused ? Math.min(baseScanThroughput, meteredCap) : 0;
  const lobbyToConcourse = p === "EGRESS" ? 0 : 220 * dt;
  const concourseToSeats = ["DOORS", "OPENER", "HEADLINER", "ENCORE"].includes(p) ? 165 * dt : 36 * dt;

  if (admissionsOpen) {
    moveFlow("outsideQueue", "security", securityThroughput * dt);
    moveFlow("security", "ticketScan", securityThroughput * 0.9 * dt);
  }
  if (interlockPaused && admissions.mode !== "PAUSED") {
    admissions.mode = "PAUSED";
    admissions.autoPausedAt = formatSimTime(state.simMinute);
    createIncident("Crowd", "CRITICAL", "Admissions capacity interlock paused scanners", "Security Lanes", [
      "Ticket scan stopped at legal capacity",
      "Outside queue and ticket scan will build",
      "Override capacity only if operator accepts overcapacity risk"
    ]);
    addDispatch("ADMISSIONS", "Capacity interlock hit. Scanners paused automatically.");
  }
  const scanRequest = Math.min(scanThroughput * dt, capacityRemaining);
  const scanned = moveFlow("ticketScan", "lobby", scanRequest);
  admissions.scanned += scanned;
  admissions.inside += scanned;
  state.crowd.attendance = admissions.inside;
  state.peakAttendance = Math.max(state.peakAttendance, state.crowd.attendance);

  if (admissions.mode === "CLOSED" && state.crowd.outsideQueue > 0 && ["HEADLINER", "ENCORE", "EGRESS"].includes(p)) {
    const turned = Math.min(state.crowd.outsideQueue, 12 * dt);
    state.crowd.outsideQueue -= turned;
    admissions.turnedAway += turned;
  }

  if (scanned > 0) {
    const ticketRevenue = scanned * 52;
    state.money.tickets += ticketRevenue;
    state.money.parking += scanned * 0.42 * 18;
    state.money.revenue += ticketRevenue + scanned * 0.42 * 18;
  }

  moveFlow("lobby", "concourse", lobbyToConcourse);
  moveFlow("concourse", "seatsFloor", concourseToSeats);

  if (p === "CHANGEOVER") {
    const movers = Math.min(state.crowd.seatsFloor * 0.006 * dt, 45 * dt);
    state.crowd.seatsFloor -= movers;
    state.crowd.concourse += movers * 0.72;
    state.crowd.lobby += movers * 0.28;
    concessions.waiting += movers * 0.34;
  }

  if (p === "EGRESS" || p === "LOAD-OUT") {
    const toEgress = moveFlow("seatsFloor", "egress", 420 * dt);
    state.crowd.concourse += toEgress * 0.32;
    state.crowd.lobby += toEgress * 0.18;
    moveFlow("concourse", "lobby", 310 * dt);
    const exited = moveFlow("lobby", "exited", 560 * dt) + moveFlow("egress", "exited", 700 * dt);
    admissions.inside = Math.max(0, admissions.inside - exited);
    admissions.exited += exited;
    state.crowd.attendance = admissions.inside;
  }

  const wait = state.crowd.outsideQueue / Math.max(1, securityThroughput);
  state.totalWaitMinutes += wait * dt;
  state.waitSamples += dt;

  if (state.crowd.outsideQueue > 900) {
    createIncident("Crowd", "WARNING", "Outside queue density high", "Main Lobby", [
      "Security throughput below arrival rate",
      "Ticket scan lanes backing up",
      "Guest experience score degrading"
    ]);
  }
  if (state.crowd.outsideQueue > 1600) {
    createIncident("Security", "CRITICAL", "Exterior queue overcapacity", "Main Lobby", [
      "Lightning/weather exposure risk increased",
      "Entrances require extra units",
      "Doors delay likely"
    ]);
  }
  if (admissions.inside >= capacity * 0.98 && admissions.inside < capacity && !admissions.overrideCapacity) {
    createIncident("Crowd", "WARNING", "Admissions nearing hard capacity", "Security Lanes", [
      "98 percent capacity threshold reached",
      "Prepare to meter scan flow",
      "Capacity interlock armed"
    ]);
  }
  if (admissions.overrideCapacity && admissions.inside > capacity) {
    createIncident("Crowd", "CRITICAL", "Capacity override active - venue over legal cap", "Main Lobby", [
      "Operator override bypassed scanner interlock",
      "Guest experience and safety scores falling",
      "Turn away additional arrivals immediately"
    ]);
  }
}

function updateLoadInOperations(dt) {
  if (!state.crewDeployed) return;
  const p = phase();
  const isLogistics = ["LOAD-IN", "LOAD-OUT"].includes(p);
  if (!isLogistics) return;

  const truckRate = p === "LOAD-IN" ? 0.22 : p === "LOAD-OUT" ? 0.18 : 0.025;
  state.trucksArrived = clamp(state.trucksArrived + truckRate * dt, 0, p === "LOAD-OUT" ? 18 : 14);

  const dockFactor = state.dockDoorsOpen ? 1 : 0.35;
  const forkliftFactor = 1 + state.forkliftsActive * 0.28;
  const handFactor = staffingCoverage("Stagehands") * staffingCoverage("Production");
  const workRate = (p === "LOAD-IN" ? 2.8 : 3.1) * dockFactor * forkliftFactor * handFactor;
  if (p === "LOAD-IN") {
    state.unloadProgress = clamp(state.unloadProgress + workRate * dt, 0, 100);
    state.unloadedCases = Math.round(state.unloadProgress * 7.4);
  } else {
    state.strikeProgress = clamp(state.strikeProgress + workRate * 0.8 * dt, 0, 100);
    state.unloadedCases = Math.max(0, Math.round((100 - state.strikeProgress) * 7.4));
  }

  if (p === "LOAD-IN" && state.simMinute > effectiveStart(2) - 8 && state.unloadProgress < 68) {
    state.timelineDelay = Math.max(state.timelineDelay, 6);
    createIncident("Facility", "ADVISORY", "Load-in running behind at dock", "Loading Dock", [
      "Setup may start late",
      "Stagehands requested on service road"
    ]);
  }
}

function updateCrewBreak(dt) {
  if (!state.breakActive) return;
  state.breakTimer += dt;
  const previous = state.breakStatus;
  if (state.breakTimer < 3) {
    state.breakStatus = "TO BREAK";
  } else if (state.breakTimer < 11) {
    state.breakStatus = "ON BREAK";
    state.crewFatigue = clamp(state.crewFatigue - dt * 2.2, 0, 100);
  } else if (state.breakTimer < 15) {
    state.breakStatus = "RETURNING";
  } else {
    state.breakActive = false;
    state.breakTimer = 0;
    state.breakStatus = "WORKING";
    addDispatch("PM", "Break complete. Crew returning to assigned jobs.");
  }
  if (previous !== state.breakStatus && state.breakActive) {
    addDispatch("PM", `Crew break status: ${state.breakStatus}.`);
  }
}

function updateCrewTasks(dt) {
  if (!state.crewDeployed) return;
  const p = phase();
  updateCrewBreak(dt);
  const activeWork = ["LOAD-IN", "SETUP", "SOUND CHECK", "CHANGEOVER", "LOAD-OUT"].includes(p);
  state.crewFatigue = activeWork && state.breakStatus !== "ON BREAK"
    ? clamp(state.crewFatigue + dt * 0.28, 0, 100)
    : clamp(state.crewFatigue - dt * 0.08, 0, 100);
  const crewFactor = staffingCoverage("Stagehands") * staffingCoverage("Production");
  state.crewTasks.forEach((task) => {
    if (task.progress >= 100) {
      task.status = "DONE";
      return;
    }
    if (task.phase !== p) {
      task.status = task.progress > 0 ? "PAUSED" : "WAITING";
      return;
    }
    task.status = "ACTIVE";
    const speed = taskSpeed(task, crewFactor);
    task.progress = clamp(task.progress + speed * dt, 0, 100);
    if (task.progress >= 100) {
      task.status = "DONE";
      addDispatch(task.dept.toUpperCase(), `${task.name} complete.`);
    }
  });

  state.setupProgress = averageTaskProgress(["Stage Build", "Power Deployment", "Rigging Prep", "Lighting Hang/Cable", "PA + Stage Audio", "Video Deployment", "FOH + Network Build", "Patch + System Config"]);
  updateBandLifecycle(dt);
  if (p === "SOUND CHECK") {
    state.production.soundCheckProgress = Math.max(
      state.production.soundCheckProgress,
      averageTaskProgress(["Line Check", "Band Soundcheck", "Lighting / Video Check"])
    );
    state.band.soundcheck = taskProgress("Band Soundcheck");
  }
}

function taskSpeed(task, crewFactor) {
  const fatiguePenalty = 1 - clamp(state.crewFatigue - 55, 0, 45) / 100;
  const breakPenalty = state.breakActive ? 0.32 : 1;
  const base = {
    "Warehouse Prep": 3.2,
    "Truck Load": 3.0,
    "Load-In Cases": 2.8 * (state.dockDoorsOpen ? 1 : 0.35) * (1 + state.forkliftsActive * 0.28),
    "Stage Build": 2.15,
    "Power Deployment": 1.95 * staffingCoverage("Electricians"),
    "Rigging Prep": 1.75,
    "Lighting Hang/Cable": 1.7 * (state.production.lightingNodeFault ? 0.72 : 1),
    "PA + Stage Audio": 1.78,
    "Video Deployment": 1.65,
    "FOH + Network Build": 1.85 * staffingCoverage("IT"),
    "Patch + System Config": 1.62,
    "Band Instrument Load": state.band.status === "ARRIVED" || state.band.status === "BAND SETUP" ? 2.45 : 0,
    "Line Check": 1.95,
    "Band Soundcheck": 1.82,
    "Lighting / Video Check": 1.75,
    "Preset": 2.2,
    "Show Call": 4.4,
    "Strike": 2.5 * (1 + state.forkliftsActive * 0.2),
    "Truck Pack": 2.2 * (state.dockDoorsOpen ? 1 : 0.4),
    "Venue Sweep": 2
  }[task.name] || 1;
  return base * crewFactor * fatiguePenalty * breakPenalty;
}

function averageTaskProgress(names) {
  const selected = state.crewTasks.filter((task) => names.includes(task.name));
  return selected.reduce((sum, task) => sum + task.progress, 0) / Math.max(1, selected.length);
}

function taskProgress(name) {
  return state.crewTasks.find((task) => task.name === name)?.progress || 0;
}

function updateBandLifecycle(dt) {
  if (!state.crewDeployed) return;
  if (state.setupProgress >= 42 && ["OFFSITE", "BANDING"].includes(state.band.status)) {
    state.band.status = "ARRIVING";
    addDispatch("BAND TM", "Band vans are at the dock. Backline instruments inbound.");
  }
  if (state.band.status === "ARRIVING") {
    state.band.arrivalProgress = clamp(state.band.arrivalProgress + dt * 6, 0, 100);
    state.band.location = state.band.arrivalProgress < 55 ? "Bus Bay" : "Dressing Rooms";
    if (state.band.arrivalProgress >= 100) {
      state.band.status = "ARRIVED";
      addDispatch("BAND TM", "Band on site. Instrument load starts through service tunnel.");
    }
  }
  if (state.band.status === "ARRIVED" && phase() === "SETUP") {
    state.band.status = "BAND SETUP";
  }
  if (state.band.status === "BAND SETUP") {
    state.band.instrumentLoad = taskProgress("Band Instrument Load");
    state.band.location = state.band.instrumentLoad < 100 ? "Stage / Backline" : "Green Room";
  }
  if (phase() === "SOUND CHECK") {
    state.band.status = "SOUND CHECK";
    state.band.soundcheck = Math.max(state.band.soundcheck, taskProgress("Band Soundcheck"));
    state.band.location = "Stage";
  }
  if (phase() === "DOORS") {
    state.band.status = "HOLDING";
    state.band.location = "Green Room";
  }
  if (phase() === "OPENER" && state.simMinute > effectiveStart(state.phaseIndex) + 8) {
    state.band.status = "STAGE READY";
    state.band.location = "Stage Left";
  }
  if (["HEADLINER", "ENCORE"].includes(phase())) {
    state.band.status = "ON STAGE";
    state.band.location = "Stage";
  }
  if (["EGRESS", "LOAD-OUT", "DARK"].includes(phase()) && state.phaseIndex > 0) {
    state.band.status = phase() === "DARK" ? "BANDING" : "OFF STAGE";
    state.band.location = "Band Room";
  }
}

function updateRooms(dt) {
  const c = state.crowd;
  const crewActive = state.crewDeployed ? 1 : 0;
  const loadFactor = state.unloadProgress / 100;
  const truckCrowd = state.trucksArrived * 9;
  const dockCrew = crewActive * (18 + state.forkliftsActive * 4);
  const bandStage = ["SOUND CHECK", "STAGE READY", "ON STAGE"].includes(state.band.status) ? 7 : 0;
  const bandGreen = state.band.location === "Green Room" ? 8 : 0;
  const bandRoom = state.band.location === "Band Room" ? 10 : 0;
  const bandDressing = state.band.location === "Dressing Rooms" ? 8 : 0;
  const bandBus = state.band.location === "Bus Bay" ? 8 : 0;
  const breakRoomStaff = state.breakActive && state.breakStatus === "ON BREAK" ? 44 : 0;
  const workOrderOccupancy = workOrderRoomOccupancy();
  const mappings = {
    floor: c.seatsFloor * 0.38,
    lowerBowl: c.seatsFloor * 0.32,
    upperBowl: c.seatsFloor * 0.3,
    mainLobby: c.lobby + c.security * 0.24 + c.ticketScan * 0.4,
    securityLanes: c.security + c.outsideQueue * 0.08,
    vipEntry: ["DOORS", "OPENER"].includes(phase()) ? c.ticketScan * 0.04 + 18 : 6,
    eastConcourse: c.concourse * 0.25,
    westConcourse: c.concourse * 0.25,
    northConcourse: c.concourse * 0.25,
    southConcourse: c.concourse * 0.25,
    vomNorth: c.seatsFloor * 0.018 + c.concourse * 0.02,
    vomSouth: c.seatsFloor * 0.018 + c.concourse * 0.02,
    eastExit: phase() === "EGRESS" ? c.egress * 0.18 + c.concourse * 0.08 : c.concourse * 0.01,
    westExit: phase() === "EGRESS" ? c.egress * 0.18 + c.concourse * 0.08 : c.concourse * 0.01,
    boxOffice: c.ticketScan * 0.25,
    merch: phase() === "CHANGEOVER" ? 90 + c.concourse * 0.02 : c.concourse * 0.01,
    concessionsA: concessions.waiting * 0.32,
    concessionsB: concessions.waiting * 0.36,
    concessionsC: concessions.waiting * 0.32,
    restroomsA: phase() === "CHANGEOVER" ? c.seatsFloor * 0.012 : c.concourse * 0.012,
    restroomsB: phase() === "CHANGEOVER" ? c.seatsFloor * 0.01 : c.concourse * 0.01,
    restroomsC: phase() === "CHANGEOVER" ? c.seatsFloor * 0.009 : c.concourse * 0.011,
    restroomsD: phase() === "CHANGEOVER" ? c.seatsFloor * 0.009 : c.concourse * 0.009,
    stage: (phase() === "CHANGEOVER" ? 96 : ["HEADLINER", "ENCORE"].includes(phase()) ? 64 : crewActive * (12 + loadFactor * 42)) + bandStage,
    stageLeft: (["SOUND CHECK", "OPENER", "HEADLINER", "ENCORE", "CHANGEOVER"].includes(phase()) ? 42 : crewActive * (6 + loadFactor * 24)) + (state.band.status === "STAGE READY" ? 6 : 0),
    stageRight: ["SOUND CHECK", "OPENER", "HEADLINER", "ENCORE", "CHANGEOVER"].includes(phase()) ? 38 : crewActive * (6 + loadFactor * 20),
    foh: ["SOUND CHECK", "OPENER", "HEADLINER", "ENCORE"].includes(phase()) ? 18 : crewActive * 7,
    loadingDock: ["LOAD-IN", "LOAD-OUT"].includes(phase()) ? dockCrew + truckCrowd * 0.25 : crewActive * 6,
    truckLot: ["LOAD-IN", "LOAD-OUT"].includes(phase()) ? 22 + truckCrowd : crewActive * 8,
    northGarage: ["DOORS", "OPENER"].includes(phase()) ? 95 : phase() === "EGRESS" ? 135 : 18,
    southGarage: ["DOORS", "OPENER"].includes(phase()) ? 118 : phase() === "EGRESS" ? 190 : 24,
    busBay: (["LOAD-IN", "LOAD-OUT"].includes(phase()) ? crewActive * 54 : phase() === "EGRESS" ? 38 : crewActive * 5) + bandBus,
    freightElevator: ["LOAD-IN", "LOAD-OUT", "CHANGEOVER"].includes(phase()) ? crewActive * (8 + state.forkliftsActive * 2) : crewActive * 1,
    serviceTunnel: ["LOAD-IN", "SETUP", "SOUND CHECK", "CHANGEOVER", "LOAD-OUT"].includes(phase()) ? crewActive * (24 + state.forkliftsActive * 5) : crewActive * 5,
    greenRoom: (["OPENER", "HEADLINER", "ENCORE"].includes(phase()) ? 34 : crewActive * 8) + bandGreen,
    dressing1: (phase() === "DARK" ? 7 : ["OPENER", "HEADLINER", "ENCORE"].includes(phase()) ? 14 : crewActive * 3) + bandRoom + bandDressing * 0.5,
    dressing2: (["OPENER", "HEADLINER", "ENCORE"].includes(phase()) ? 13 : crewActive * 3) + bandDressing * 0.5,
    prodOffice: crewActive * 19,
    catering: (["LOAD-IN", "SETUP", "SOUND CHECK"].includes(phase()) ? crewActive * 44 : crewActive * 16) + breakRoomStaff,
    securityOffice: crewActive * 10,
    medical: 6,
    storage: ["LOAD-IN", "LOAD-OUT"].includes(phase()) ? 18 : 4,
    mainElectrical: crewActive * 3,
    generatorYard: backup.gen1.state !== "OFF" || backup.gen2.state !== "OFF" ? 6 : 1,
    hvacPlant: 5,
    mdf: 2,
    idfA: 1,
    idfB: 1,
    riggingLoft: ["LOAD-IN", "SETUP", "CHANGEOVER", "LOAD-OUT"].includes(phase()) ? crewActive * 12 : crewActive * 2
  };

  rooms.forEach((room) => {
    const runtime = roomRuntime.get(room.id);
    runtime.occupancy = clamp((mappings[room.id] ?? runtime.occupancy * 0.98) + (workOrderOccupancy[room.id] || 0), 0, room.cap * 1.25);
    const heatGain = runtime.occupancy / Math.max(1, room.cap) * 7;
    const weatherGain = Math.max(0, state.weather.temp - 70) * 0.06;
    const hvacEffect = averageCoolingEffect(room.group);
    const target = room.baseTemp + heatGain + weatherGain - hvacEffect;
    runtime.temp += (target - runtime.temp) * dt * 0.025;
    runtime.network = networkStateForRoom(room);
    runtime.power = room.power + runtime.occupancy * 0.008;
    if (state.lobbyDecorativeLights && room.id === "mainLobby") runtime.power += 14;
  });
}

function workOrderRoomOccupancy() {
  return state.workOrders.reduce((counts, order) => {
    if (order.status === "DONE") return counts;
    const incident = incidentById(order.incidentId);
    const id = order.status === "GETTING KIT" ? supportRoomIdForOrder(order, incident) : order.destinationId;
    counts[id] = (counts[id] || 0) + 3;
    return counts;
  }, {});
}

function averageCoolingEffect(group) {
  const active = hvac.filter((ahu) => ahu.online);
  if (!active.length) return -2;
  const base = active.reduce((sum, ahu) => sum + ahu.cooling / 100, 0) / active.length;
  const groupBonus = group === "Arena Bowl" ? hvac[0].online ? 1.4 : -1 : group === "Public" ? hvac[1].online ? 1 : -0.5 : hvac[2].online ? 0.6 : -0.3;
  return base * 5 + groupBonus;
}

function networkStateForRoom(room) {
  if (state.coreAFailed && state.failoverTimer < 2.5) return "FAILING OVER";
  if (state.coreAFailed && ["MDF", "FOH", "IDF A", "IDF B"].includes(room.name)) return "DEGRADED";
  if (state.production.lightingNodeFault && ["Stage Right", "Stage", "FOH"].includes(room.name)) return "DEGRADED";
  return "OK";
}

function updateConcessions(dt) {
  const p = phase();
  const demand = p === "CHANGEOVER" ? 92 : p === "DOORS" ? 28 : p === "OPENER" ? 35 : p === "HEADLINER" ? 8 : p === "EGRESS" ? 14 : 3;
  const posFactor = concessions.pos === "ONLINE" ? 1 : 0.42;
  const capacityPerMinute = concessions.openStands * (60 / concessions.avgService) * 4 * posFactor;
  concessions.waiting = Math.max(0, concessions.waiting + demand * dt - capacityPerMinute * dt);
  const served = Math.min(demand * dt + concessions.waiting * 0.04, capacityPerMinute * dt);
  const spend = served * 13.5;
  state.money.concessions += spend;
  state.money.merch += (p === "DOORS" || p === "EGRESS" ? served * 1.8 : served * 0.4);
  state.money.revenue += spend + (p === "DOORS" || p === "EGRESS" ? served * 1.8 : served * 0.4);

  Object.keys(concessions.inventory).forEach((item) => {
    const use = served * ({ Water: 0.45, Soda: 0.31, "Hot Dogs": 0.12, Pizza: 0.09 }[item] || 0.05);
    concessions.inventory[item] = Math.max(0, concessions.inventory[item] - use);
  });

  if (concessions.waiting > 95) {
    createIncident("Facility", "WARNING", "West concessions queue at 97+ guests", "Concessions B", [
      "Concourse density increases",
      "Guest experience score degrading",
      "More POS staff recommended"
    ]);
  }
  if (concessions.inventory.Water < 260) {
    createIncident("Facility", "ADVISORY", "Water inventory below comfort threshold", "Concessions A");
  }
}

function updateStaffAndMoney(dt) {
  let perHour = 0;
  Object.entries(staff).forEach(([name, group]) => {
    perHour += group.checkedIn * staffRates[name];
  });
  const overtimeFactor = state.simMinute > 660 ? 1.35 : 1;
  const cost = perHour * overtimeFactor * (dt / 60);
  state.money.staffing += cost;
  state.money.overtime += overtimeFactor > 1 ? cost * 0.35 : 0;
  state.money.cost += cost;
}

function phasePowerMultiplier() {
  return {
    "DARK": 0.55,
    "LOAD-IN": 0.9,
    "SETUP": 1.05,
    "SOUND CHECK": 1.22,
    "DOORS": 1.16,
    "OPENER": 1.34,
    "CHANGEOVER": 1.2,
    "HEADLINER": 1.62,
    "ENCORE": 1.72,
    "EGRESS": 1.08,
    "LOAD-OUT": 0.95
  }[phase()] || 0.8;
}

function updateElectrical(dt) {
  const multiplier = phasePowerMultiplier();
  const crowdLoad = state.crowd.attendance / capacity;
  panels.forEach((panel) => {
    const base = {
      "House Lighting": state.lobbyDecorativeLights ? 32 : 18,
      HVAC: 72 + crowdLoad * 85 + Math.max(0, state.weather.temp - 74) * 2.5,
      Concessions: 48 + concessions.openStands * 8,
      "Production A": 80 * multiplier + state.extraLightingLoad,
      "Production B": 64 * multiplier,
      "Stage Motors": phase() === "CHANGEOVER" ? 62 : phase() === "LOAD-IN" ? 44 : 18,
      FOH: 18 + (["SOUND CHECK", "OPENER", "HEADLINER", "ENCORE"].includes(phase()) ? 12 : 0),
      Video: 42 * multiplier,
      Audio: 36 * multiplier,
      Emergency: 15
    }[panel.name];
    panel.kw += (base - panel.kw) * clamp(dt * 0.12, 0, 1);
  });

  const totalKw = panels.reduce((sum, panel) => sum + panel.kw, 0);
  utilities.A.online = !state.utilityAFailed;
  const imbalance = state.extraLightingLoad * 0.9 + (phase() === "HEADLINER" ? 34 : 0);
  utilities.A.l1 = totalKw * 1.55 + imbalance;
  utilities.A.l2 = totalKw * 1.48 - imbalance * 0.35;
  utilities.A.l3 = totalKw * 1.52 + imbalance * 0.55;
  utilities.B.l1 = totalKw * 0.42;
  utilities.B.l2 = totalKw * 0.43;
  utilities.B.l3 = totalKw * 0.41;

  const maxPanel = panels.find((panel) => panel.kw / panel.max > 0.96);
  if (maxPanel) {
    createIncident("Electrical", "CRITICAL", `${maxPanel.name} PANEL OVERLOAD`, "Main Electrical", [
      "Production loads at risk",
      "Operators should shed noncritical load",
      "Electricians requested at main electrical"
    ]);
  } else if (phaseImbalancePct() > 18) {
    createIncident("Electrical", "WARNING", "PHASE IMBALANCE on Utility A", "Main Electrical", [
      "L1/L2/L3 current spread exceeds threshold",
      "Lighting load likely uneven",
      "Panel monitoring required"
    ]);
  }

  state.money.power += totalKw * 0.18 * (dt / 60);
  state.money.cost += totalKw * 0.18 * (dt / 60);
  updateBackupPower(dt);
}

function phaseImbalancePct() {
  const values = [utilities.A.l1, utilities.A.l2, utilities.A.l3];
  const avg = values.reduce((a, b) => a + b, 0) / 3;
  return ((Math.max(...values) - Math.min(...values)) / avg) * 100;
}

function updateBackupPower(dt) {
  if (state.utilityAFailed) {
    state.atsTimer += dt;
    Object.values(backup).filter((item) => item.label?.startsWith("UPS")).forEach((ups) => {
      ups.charge = clamp(ups.charge - dt * ups.load * 0.018, 0, 100);
      ups.runtime = clamp(ups.charge / Math.max(1, ups.load) * 11.5, 0, 90);
    });
    [backup.gen1, backup.gen2].forEach((gen, index) => {
      if (gen.state === "OFF") gen.state = "STARTING";
      gen.timer += dt;
      if (gen.state === "STARTING" && gen.timer > 0.7 + index * 0.4) gen.state = "WARMUP";
      if (gen.state === "WARMUP" && gen.timer > 2.2 + index * 0.4) {
        gen.state = Math.random() < 0.08 && index === 0 ? "FAULT" : "AVAILABLE";
      }
      if (gen.state === "AVAILABLE" && state.atsTimer > 3) gen.state = "ONLINE";
      if (gen.state === "ONLINE") {
        gen.fuel = clamp(gen.fuel - dt * 0.12, 0, 100);
        state.money.fuel += 8.7 * dt;
        state.money.cost += 8.7 * dt;
      }
    });
    if (state.atsTimer > 3.5 && backup.gen1.state !== "ONLINE" && backup.gen2.state !== "ONLINE") {
      createIncident("Electrical", "CRITICAL", "ATS transfer failed - critical systems on UPS", "Main Electrical", [
        "UPS runtime decreasing",
        "Emergency lighting isolated",
        "Production power unavailable"
      ]);
    }
  } else {
    state.atsTimer = 0;
    [backup.gen1, backup.gen2].forEach((gen) => {
      if (gen.state === "ONLINE") gen.state = "AVAILABLE";
      if (gen.state !== "FAULT" && gen.state !== "OFF") {
        gen.timer = Math.max(0, gen.timer - dt * 0.5);
        if (gen.timer <= 0.1) gen.state = "OFF";
      }
    });
    [backup.upsA, backup.upsB].forEach((ups) => {
      ups.charge = clamp(ups.charge + dt * 0.18, 0, 100);
      ups.runtime = clamp(ups.charge / Math.max(1, ups.load) * 11.5, 0, 90);
    });
  }
}

function updateNetwork(dt) {
  if (state.coreAFailed) {
    state.failoverTimer += dt;
    switches[0].online = false;
    switches[0].loss = 100;
    switches[0].latency = 999;
    switches[0].cpu = 0;
    switches[1].role = "Gateway";
    switches[1].bandwidth = clamp(switches[1].bandwidth + dt * 14, 0, 92);
    switches[1].cpu = clamp(switches[1].cpu + dt * 8, 0, 88);
    createIncident("Network", "CRITICAL", "CORE-SW-A FAILURE", "MDF", [
      "Dante Primary degraded",
      "Lighting network degraded",
      "POS East unavailable",
      "Guest Wi-Fi capacity reduced"
    ]);
  }

  const crowdFactor = state.crowd.attendance / capacity;
  switches.forEach((sw, index) => {
    if (!sw.online) return;
    const phaseTraffic = ["DOORS", "CHANGEOVER", "HEADLINER", "EGRESS"].includes(phase()) ? 1 : 0.55;
    sw.bandwidth = clamp(sw.bandwidth + (crowdFactor * 80 * phaseTraffic - sw.bandwidth) * dt * 0.03 + (Math.random() - 0.5) * dt * 4, 3, 96);
    sw.clients = Math.round((index < 2 ? 150 : 120) + crowdFactor * (index > 3 ? 950 : 240));
    sw.cpu = clamp(18 + sw.bandwidth * 0.58 + (state.coreAFailed && index === 1 ? 18 : 0), 8, 96);
    sw.temp = clamp(sw.temp + (88 + sw.cpu * 0.42 - sw.temp) * dt * 0.02, 86, 142);
    sw.latency = clamp(1 + sw.bandwidth * 0.035 + (state.coreAFailed ? 4 : 0) + Math.random() * 0.2, 1, 16);
    sw.loss = sw.bandwidth > 86 ? (sw.bandwidth - 86) * 0.12 : 0;
  });

  state.production.danteLatency = switches.find((sw) => sw.name === "STAGE-SW-01").latency + (state.coreAFailed ? 3.8 : 0);
  state.production.danteLoss = switches.find((sw) => sw.name === "STAGE-SW-01").loss + (state.coreAFailed ? 0.7 : 0);
  if (state.production.danteLatency > 6 || state.production.danteLoss > 0.5) {
    createIncident("Production", "WARNING", "Dante Primary latency warning", "FOH", [
      "Audio transport redundancy should be checked",
      "Stage rack clock stability degraded"
    ]);
  }
}

function updateProduction(dt) {
  if (phase() === "SOUND CHECK") {
    const crewFactor = staffingCoverage("Production") * staffingCoverage("Stagehands");
    state.production.soundCheckProgress = clamp(state.production.soundCheckProgress + dt * 1.65 * crewFactor, 0, 100);
    if (state.simMinute > effectiveStart(4) - 12 && state.production.soundCheckProgress < 85) {
      state.timelineDelay = Math.max(state.timelineDelay, 10);
      createIncident("Production", "WARNING", "Sound check running long - doors delayed", "FOH", [
        "Doors pushed ten minutes",
        "Headliner schedule at risk"
      ]);
    }
  }

  if (phase() === "CHANGEOVER") {
    const crewFactor = staffingCoverage("Stagehands") * (state.production.lightingNodeFault ? 0.82 : 1);
    state.production.changeoverProgress = clamp(state.production.changeoverProgress + dt * 3.85 * crewFactor, 0, 100);
    if (state.production.changeoverProgress < 65 && state.simMinute > effectiveStart(7) - 12) {
      state.timelineDelay = Math.max(state.timelineDelay, 12);
      createIncident("Production", "WARNING", "Changeover behind plan", "Stage", [
        "Headliner likely delayed",
        "Stagehands need reassignment"
      ]);
    }
  }

  if (["HEADLINER", "ENCORE"].includes(phase())) {
    state.uptimeMinutes += dt;
    if (Math.random() < dt * 0.004 && !state.production.rfInterference) {
      state.production.rfInterference = true;
      createIncident("Production", "ADVISORY", "RF interference detected on VOX 2", "Stage Left", [
        "Audio team coordinating frequency change"
      ]);
    }
    if (Math.random() < dt * 0.002 && !state.production.playbackAFailed) {
      state.production.playbackAFailed = true;
      state.production.videoBackupActive = true;
      createIncident("Production", "WARNING", "Playback A failed - switched to Playback B", "FOH", [
        "Video backup active",
        "Record path remains online"
      ]);
    }
  }
}

function updateHvac(dt) {
  const crowdLoad = state.crowd.attendance / capacity;
  hvac.forEach((ahu, index) => {
    const weatherBoost = Math.max(0, state.weather.temp - 68) * 1.5;
    const phaseBoost = ["DOORS", "OPENER", "HEADLINER", "ENCORE", "EGRESS"].includes(phase()) ? 10 : 0;
    const targetCooling = clamp(24 + crowdLoad * 72 + weatherBoost + phaseBoost - index * 4, 0, 100);
    if (ahu.online) {
      ahu.cooling += (targetCooling - ahu.cooling) * dt * 0.05;
      ahu.fan += (35 + targetCooling * 0.62 - ahu.fan) * dt * 0.05;
      ahu.supply += (54 - ahu.supply) * dt * 0.04;
      ahu.ret += (68 + crowdLoad * 7 + Math.max(0, state.weather.temp - 75) * 0.1 - ahu.ret) * dt * 0.025;
      ahu.static = clamp(1.0 + ahu.fan / 100 * 1.1, 0.8, 2.6);
    } else {
      ahu.cooling = clamp(ahu.cooling - dt * 4, 0, 100);
      ahu.fan = clamp(ahu.fan - dt * 4, 0, 100);
      ahu.supply += dt * 0.08;
      ahu.ret += dt * 0.05;
    }
    if (!ahu.online) {
      createIncident("HVAC", "WARNING", `${ahu.name} offline`, "HVAC Plant", [
        "Temperature will climb slowly",
        "Guest comfort score degrading"
      ]);
    }
    if (ahu.ret > 78) {
      createIncident("HVAC", "ADVISORY", `${ahu.name} return temp high`, "HVAC Plant");
    }
  });
}

function updateWeather(dt) {
  state.weather.temp += (Math.sin(state.simMinute / 90) * 0.02 + (Math.random() - 0.5) * 0.035) * dt;
  state.weather.rain = clamp(state.weather.rain + (Math.random() - 0.5) * 0.012 * dt, 0, 1);
  state.weather.wind = clamp(state.weather.wind + (Math.random() - 0.48) * 0.18 * dt, 0, 45);
  state.weather.lightning = clamp(state.weather.lightning + (Math.random() - 0.49) * 0.6 * dt, 1, 40);

  if (state.weather.rain > 0.72) {
    createIncident("Weather", "ADVISORY", "Heavy rain slowing arrivals", "Main Lobby", [
      "Exterior queue movement reduced",
      "Wet floor patrol recommended"
    ]);
  }
  if (state.weather.lightning < 8) {
    createIncident("Weather", "WARNING", "Lightning within fake 8 miles", "Truck Lot", [
      "Outdoor queue exposure warning",
      "Dock activity requires supervisor approval"
    ]);
  }
  if (state.weather.wind > 30 && ["LOAD-IN", "LOAD-OUT"].includes(phase())) {
    createIncident("Weather", "ADVISORY", "High wind at loading dock doors", "Loading Dock");
  }
}

function updateConsequences() {
  if (phase() === "DOORS" && state.crowd.outsideQueue > 1100) {
    state.timelineDelay = Math.max(state.timelineDelay, 8);
  }
  if (state.timelineDelay >= 8 && state.timelineStatus !== "DELAYED") {
    addDispatch("CONTROL", "Timeline marked DELAYED due to operational constraints.");
  }
  state.timelineStatus = classifyTimeline();
}

function updateSimulation(dt) {
  state.simMinute += dt;
  const nextScheduled = effectiveStart(state.phaseIndex + 1);
  if (nextScheduled !== undefined && state.simMinute >= nextScheduled && state.phaseIndex < phaseNames.length - 1 && phaseReadyForAutoAdvance()) {
    advancePhase(false);
  }

  updateWeather(dt);
  updateCrowd(dt);
  updateGuestBehavior(dt);
  updateLoadInOperations(dt);
  updateStaffMovement(dt);
  updateCrewTasks(dt);
  updateWorkOrders(dt);
  updateRooms(dt);
  updateConcessions(dt);
  updateStaffAndMoney(dt);
  updateElectrical(dt);
  updateNetwork(dt);
  updateProduction(dt);
  updateHvac(dt);
  updateConsequences();

  incidentAccumulator += dt;
  dispatchAccumulator += dt;
  if (incidentAccumulator > 18) {
    incidentAccumulator = 0;
    maybeRandomIncident();
  }
  if (dispatchAccumulator > 9) {
    dispatchAccumulator = 0;
    randomDispatch();
  }
}

function updateStaffMovement(dt) {
  if (!state.crewDeployed) return;
  state.staffIntake = clamp(state.staffIntake + dt * 4.5, 0, 100);
}

function updateGuestBehavior(dt) {
  const publicPhase = ["DOORS", "OPENER", "CHANGEOVER", "HEADLINER", "ENCORE", "EGRESS"].includes(phase());
  state.guestErrandLoad += (publicPhase ? dt * 18 : -dt * 22);
  state.guestErrandLoad = clamp(state.guestErrandLoad, 0, 100);

  const activeTrouble = state.badGuests.filter((guest) => guest.stage !== "REMOVED");
  if (
    publicPhase &&
    state.crowd.attendance > 600 &&
    activeTrouble.length < 2 &&
    Math.random() < dt * 0.032
  ) {
    spawnBadGuest();
  }

  state.badGuests.forEach((guest) => {
    if (guest.stage === "REMOVED") return;
    const previous = guest.stage;
    const securityCoverage = staffingCoverage("Security") * (staff.Security.checkedIn / staff.Security.scheduled);
    guest.progress = clamp(guest.progress + dt * (14 + securityCoverage * 8), 0, 110);
    if (guest.progress < 24) guest.stage = "ACTING OUT";
    else if (guest.progress < 48) guest.stage = "SECURITY EN ROUTE";
    else if (guest.progress < 92) guest.stage = "ESCORTING";
    else guest.stage = "REMOVED";

    if (previous !== guest.stage) {
      if (guest.stage === "SECURITY EN ROUTE") addDispatch("SECURITY", `${guest.label}: two units responding via concourse.`);
      if (guest.stage === "ESCORTING") addDispatch("SECURITY", `${guest.label}: contact made, escorting to ${guest.exitName}.`);
      if (guest.stage === "REMOVED") {
        addDispatch("SECURITY", `${guest.label}: guest removed from venue.`);
        const incident = incidentById(guest.incidentId);
        if (incident && incident.status !== "RESOLVED") {
          incident.status = "RESOLVED";
          incident.resolvedAt = formatSimTime(state.simMinute);
        }
      }
    }
  });

  state.badGuests = state.badGuests.filter((guest) => guest.stage !== "REMOVED" || state.simMinute - guest.startedAt < 8);
}

function spawnBadGuest() {
  const spots = [
    { sourceId: "eastConcourse", exitId: "eastExit", label: "Concourse behavior issue" },
    { sourceId: "westConcourse", exitId: "westExit", label: "Guest refusing usher direction" },
    { sourceId: "concessionsB", exitId: "eastExit", label: "Concessions disturbance" },
    { sourceId: "lowerBowl", exitId: "westExit", label: "Seat dispute escalating" },
    { sourceId: "floor", exitId: "eastExit", label: "Floor guest needs removal" }
  ];
  const spot = spots[Math.floor(Math.random() * spots.length)];
  const source = rooms.find((room) => room.id === spot.sourceId);
  const exit = rooms.find((room) => room.id === spot.exitId);
  const incident = createIncident("Security", "ADVISORY", `Disorderly guest escort requested - ${source.name}`, source.name, [
    "Security unit diverted",
    "Nearby guests slow around the response",
    "Guest Services should backfill the area"
  ]);
  const guest = {
    id: state.nextBadGuestId++,
    label: `Guest ${String(state.nextBadGuestId + 120).padStart(3, "0")}`,
    sourceId: source.id,
    exitId: exit.id,
    exitName: exit.name,
    incidentId: incident?.id,
    progress: 0,
    stage: "ACTING OUT",
    startedAt: state.simMinute
  };
  state.badGuests.push(guest);
  addDispatch("USHERS", `${spot.label} reported at ${source.name}. Security requested.`);
}

function phaseReadyForAutoAdvance() {
  const p = phase();
  if (p === "DARK") return state.crewDeployed;
  if (p === "LOAD-IN") return state.unloadProgress >= 99.5 && tasksFinishedFor("LOAD-IN");
  if (p === "SETUP") return state.setupProgress >= 99.5 && taskProgress("Band Instrument Load") >= 99.5 && tasksFinishedFor("SETUP");
  if (p === "SOUND CHECK") return state.production.soundCheckProgress >= 99.5 && tasksFinishedFor("SOUND CHECK");
  if (p === "DOORS") return tasksFinishedFor("DOORS");
  if (p === "OPENER") return tasksFinishedFor("OPENER");
  if (p === "CHANGEOVER") return state.production.changeoverProgress >= 99.5 && tasksFinishedFor("CHANGEOVER");
  if (p === "LOAD-OUT") return state.strikeProgress >= 99.5 && tasksFinishedFor("LOAD-OUT");
  return true;
}

function tasksFinishedFor(targetPhase) {
  const tasks = state.crewTasks.filter((task) => task.phase === targetPhase);
  if (!tasks.length) return true;
  return tasks.every((task) => task.progress >= 99.5);
}

function advancePhase(manual = true) {
  if (state.phaseIndex >= phaseNames.length - 1) return;
  if (manual && !phaseReadyForAutoAdvance()) {
    addDispatch("CONTROL", `${phase()} cannot advance yet. Finish active task board first.`);
    renderAll();
    return;
  }
  const from = phase();
  state.phaseIndex += 1;
  state.phaseActualStarts[state.phaseIndex] = state.simMinute;
  const to = phase();

  if (to === "LOAD-IN" && !state.crewDeployed) {
    state.crewDeployed = true;
    state.dockDoorsOpen = true;
    state.forkliftsActive = Math.max(1, state.forkliftsActive);
    addDispatch("CONTROL", "Crew dispatched through backstage hall. Load-in phase started.");
  }

  if (to === "DOORS" && state.production.soundCheckProgress < 95) {
    state.timelineDelay += 5;
    createIncident("Production", "ADVISORY", "Doors opened with incomplete soundcheck notes", "FOH");
  }
  if (to === "DOORS" && state.admissions.mode === "CLOSED") {
    state.admissions.mode = "OPEN";
    state.admissions.autoPausedAt = null;
    addDispatch("ADMISSIONS", "Doors open. Admissions set to OPEN.");
  }
  if (to === "EGRESS") {
    state.admissions.mode = "CLOSED";
    addDispatch("ADMISSIONS", "Admissions closed for egress.");
  }
  if (to === "HEADLINER" && state.production.changeoverProgress < 100) {
    state.timelineDelay += 7;
    createIncident("Production", "WARNING", "Headliner delayed by unfinished changeover", "Stage");
  }
  if (to === "DARK" && from === "LOAD-OUT") {
    state.speed = 0;
    state.band.status = "BANDING";
    state.band.location = "Band Room";
    buildReport();
  }
  addDispatch("CONTROL", `${manual ? "Manual" : "Auto"} phase advance: ${from} to ${to}`);
  phaseStartBriefing(to);
  renderAll();
}

function phaseStartBriefing(to) {
  const briefings = {
    "LOAD-IN": [
      ["DOCK", "Truck pack opened. Cases route dock to freight elevator to stage."],
      ["STAGE", "Stagehands assigned: decks, barricade, risers, stairs, FOH platform."],
      ["POWER", "Electricians staging distro and safe power routing."]
    ],
    SETUP: [
      ["AUDIO", "A2s deploy stageboxes, mics, DIs, wireless racks, wedges, and cable trunks."],
      ["LIGHTING", "L2s hang fixtures, run power/data, and prep focus notes."],
      ["VIDEO", "V1 builds LED/video world, cameras, playback, and record paths."],
      ["IT", "Production switches, APs, Dante, lighting, POS, and staff VLANs being patched."]
    ],
    "SOUND CHECK": [
      ["AUDIO", "Line check started. A2 calls channels from stage while A1 verifies at FOH."],
      ["BAND TM", "Band moves from setup to stage for soundcheck."],
      ["LIGHTING", "LD runs focus and cue looks while fixtures report status."],
      ["VIDEO", "Camera ops take positions; playback and LED processor checks active."]
    ],
    DOORS: [
      ["STAGE MANAGER", "Preset complete. Empty cases cleared, cable paths dressed, crew at show positions."],
      ["SECURITY", "Doors open. Entry lanes and ticket scan live."],
      ["BAND TM", "Band holding in green room until stage call."]
    ],
    OPENER: [
      ["PM", "Show call active. Operators executing cues from FOH."],
      ["STAGE", "Performers moving from green room to stage left."],
      ["USHERS", "Late seating controlled through vomitories."]
    ],
    CHANGEOVER: [
      ["STAGE", "Changeover swarm: backline swap, deck reset, line check, set pieces."],
      ["CONCESSIONS", "Intermission surge expected. Stands should be fully staffed."]
    ],
    HEADLINER: [
      ["PM", "Headliner live. A1, LD, V1, stage manager, camera ops at show positions."],
      ["BAND TM", "Band on stage."]
    ],
    ENCORE: [
      ["PM", "Encore hold. Keep exits staffed and house lights ready."],
      ["LIGHTING", "Encore look loaded. Strobe/blinder limit watch active."]
    ],
    EGRESS: [
      ["SECURITY", "Egress mode. Exit banks open; concourse and lobby density spike expected."],
      ["OPS", "House lights and walk-out music active."]
    ],
    "LOAD-OUT": [
      ["STAGE", "Strike briefing complete. Fixtures, audio, video, FOH, backline, and cable return to cases."],
      ["DOCK", "Truck pack started. Forklifts shuttle stage to dock and back."],
      ["PM", "Venue sweep starts after strike lanes clear."]
    ],
    DARK: [
      ["CONTROL", "Venue returned to DARK. Post-show report ready."]
    ]
  };
  (briefings[to] || []).forEach(([from, message]) => addDispatch(from, message));
}

function maybeRandomIncident() {
  const p = phase();
  const chance = ["HEADLINER", "CHANGEOVER", "EGRESS"].includes(p) ? 0.42 : ["DOORS", "LOAD-IN", "LOAD-OUT"].includes(p) ? 0.28 : 0.12;
  if (Math.random() > chance) return;
  const templates = [
    ["Staffing", "ADVISORY", "Guest services callout affecting west lobby", "Main Lobby"],
    ["Medical", "WARNING", "Guest medical assist requested in lower bowl", "Medical"],
    ["Security", "ADVISORY", "Credential dispute at stage right", "Stage Right"],
    ["Facility", "INFO", "Custodial spill response near concessions", "Concessions B"],
    ["Production", "ADVISORY", "Moving wash fixture temp elevated", "Stage"],
    ["Network", "ADVISORY", "Guest Wi-Fi saturation high", "MDF"],
    ["Fire/Life Safety", "WARNING", "Egress aisle obstruction reported", "Lower Bowl"],
    ["Electrical", "ADVISORY", "Generator fuel burn trending high", "Generator Yard"],
    ["Crowd", "WARNING", "South concourse density rising near restrooms", "South Concourse"],
    ["Production", "WARNING", "Stage motor controller temperature high", "Rigging Loft"],
    ["Facility", "ADVISORY", "Freight elevator queue blocking service road", "Freight Elevator"],
    ["Network", "WARNING", "POS VLAN latency affecting east concessions", "Concessions A"],
    ["HVAC", "ADVISORY", "Arena bowl CO2 trend above comfort target", "HVAC Plant"],
    ["Weather", "ADVISORY", "Wet floor risk at main entry", "Main Lobby"]
  ];
  const item = templates[Math.floor(Math.random() * templates.length)];
  createIncident(...item);
}

function randomDispatch() {
  const messages = [
    ["SECURITY 3", "Need two additional units at east entrance."],
    ["STAGE", `Changeover approximately ${state.production.changeoverProgress > 70 ? "five minutes ahead" : "running tight"}.`],
    ["IT", state.coreAFailed ? "Core B has assumed gateway role." : "All production VLANs nominal."],
    ["GUEST SERVICES", `Current entry wait estimate ${Math.round(state.crowd.outsideQueue / Math.max(1, state.securityLanes * 16))} minutes.`],
    ["CATERING", "Coffee service holding. Artists requested more ice."],
    ["MEDICAL", "Medical room staffed and ready."],
    ["ELECTRICAL", `${Math.round(phaseImbalancePct())}% phase imbalance observed on production distro.`],
    ["DOCK", `${Math.round(state.unloadProgress)}% unload complete, ${state.unloadedCases} cases scanned.`],
    ["USHERS", "Vomitory flow is clear on the west side."],
    ["LIGHTING", state.production.lightingNodeFault ? "Node fault still affecting universes 4 and 5." : "Stage beams and house looks are responding."],
    ["VIDEO", state.production.videoBackupActive ? "Playback B remains program source." : "Playback A/B are synced and ready."],
    ["HVAC", `Arena bowl return air ${hvac[0].ret.toFixed(0)} degrees, cooling ${Math.round(hvac[0].cooling)}%.`]
  ];
  const [from, message] = messages[Math.floor(Math.random() * messages.length)];
  addDispatch(from, message);
}

function renderAll() {
  renderHeader();
  renderMapActions();
  renderPhaseTrack();
  renderKpis();
  renderVenueMap();
  renderInspector();
  renderAdmissions();
  renderCrowd();
  renderSetup();
  renderStaff();
  renderNpcWork();
  renderElectrical();
  renderNetwork();
  renderProduction();
  renderHvac();
  renderWeather();
  renderConcessions();
  renderDispatch();
  renderIncidents();
  renderMoney();
  renderScore();
}

function renderAdmissions() {
  const admissions = state.admissions;
  els.admissionsButtons.innerHTML = admissionsModes.map((mode) => (
    `<button type="button" data-admissions="${mode}" class="${admissions.mode === mode ? "active" : ""}">${mode}</button>`
  )).join("");
  els.admissionsMeter.value = Math.round(admissions.meteredMax);
  els.capacityOverride.classList.toggle("active", admissions.overrideCapacity);
  els.capacityOverride.textContent = admissions.overrideCapacity ? "Override On" : "Override Capacity";
  const insidePct = admissions.inside / capacity * 100;
  els.admissionsPanel.innerHTML = `
    <div class="admission-status ${insidePct >= 100 ? "critical" : insidePct >= 98 ? "warning" : ""}">
      <span class="eyebrow">Admissions Control</span>
      <strong>${admissions.mode}${admissions.autoPausedAt ? ` · auto ${admissions.autoPausedAt}` : ""}</strong>
      <span class="microcopy">${insidePct.toFixed(1)}% capacity · ${admissions.overrideCapacity ? "override active" : "hard interlock armed"}</span>
    </div>
    ${stat("Tickets Sold", fmtNumber(admissions.ticketsSold))}
    ${stat("Arrived", fmtNumber(admissions.arrived))}
    ${stat("Scanned", fmtNumber(admissions.scanned))}
    ${stat("Inside", `${fmtNumber(admissions.inside)} / ${fmtNumber(capacity)}`, insidePct >= 100 ? "critical" : insidePct >= 98 ? "warning" : "")}
    ${stat("Exited", fmtNumber(admissions.exited))}
    ${stat("Turned Away", fmtNumber(admissions.turnedAway), admissions.turnedAway > 0 ? "warning" : "")}
  `;
}

function renderMapActions() {
  els.sendCrewIn.textContent = state.crewDeployed ? "Crew On Site" : "Send Crew In";
  els.openDock.textContent = state.dockDoorsOpen ? "Dock Doors Open" : "Open Dock Doors";
  els.callForklift.textContent = `Call Forklift (${state.forkliftsActive})`;
  els.crewBreak.textContent = state.breakActive ? state.breakStatus : `Crew Break (${state.breaksGiven})`;
  els.sendCrewIn.classList.toggle("active", state.crewDeployed);
  els.openDock.classList.toggle("active", state.dockDoorsOpen);
  els.callForklift.classList.toggle("active", state.forkliftsActive > 0);
  els.crewBreak.classList.toggle("active", state.breaksGiven > 0);
  els.crewBreak.disabled = state.breakActive || !state.crewDeployed;
}

function renderHeader() {
  els.simClock.textContent = formatSimTime(state.simMinute);
  els.currentPhase.textContent = phase();
  els.timelineStatus.textContent = state.timelineStatus;
  els.timelineStatus.className = `pill ${state.timelineStatus.toLowerCase().replace(" ", "-")}`;
  const nextName = phaseNames[state.phaseIndex + 1] || "Complete";
  const nextTime = scheduledStarts[state.phaseIndex + 1] === undefined ? "--:--" : formatSimTime(effectiveStart(state.phaseIndex + 1));
  const delay = currentDelayMinutes();
  els.phaseEta.textContent = `Next: ${nextName} at ${nextTime} · ${delay >= 0 ? "+" : ""}${delay}m vs schedule`;
  els.speedButtons.innerHTML = speeds.map((speed) => (
    `<button type="button" data-speed="${speed}" class="${state.speed === speed ? "active" : ""}">${speed === 0 ? "PAUSED" : `${speed}x`}</button>`
  )).join("");
}

function renderPhaseTrack() {
  els.phaseTrack.innerHTML = phaseNames.map((name, index) => {
    const klass = index < state.phaseIndex ? "done" : index === state.phaseIndex ? "current" : "";
    return `<button type="button" class="phase-node ${klass}" data-phase="${index}">
      <span>${name}</span>
      <span>${formatSimTime(effectiveStart(index))}</span>
    </button>`;
  }).join("");
}

function renderKpis() {
  const totalInside = state.crowd.attendance;
  const avgWait = state.totalWaitMinutes / Math.max(1, state.waitSamples);
  const totalKw = panels.reduce((sum, panel) => sum + panel.kw, 0);
  const open = incidents.filter((incident) => incident.status !== "RESOLVED");
  const critical = open.filter((incident) => incident.severity === "CRITICAL");
  const profit = state.money.revenue - state.money.cost;
  const venueDensity = totalInside / capacity;
  els.attendanceKpi.textContent = `${fmtNumber(totalInside)} / ${fmtNumber(capacity)}`;
  els.densityKpi.textContent = state.crewDeployed
    ? `Dock ${Math.round(state.unloadProgress)}% · setup ${Math.round(state.setupProgress)}% · ${state.trucksArrived.toFixed(1)} trucks`
    : `Venue dark · band in ${state.band.location}`;
  els.queueKpi.textContent = fmtNumber(state.crowd.outsideQueue);
  els.waitKpi.textContent = `Entry wait ${Math.round(avgWait)}m · ${state.securityLanes} lanes`;
  els.powerKpi.textContent = `${Math.round(totalKw)} kW`;
  els.powerWarnKpi.textContent = phaseImbalancePct() > 18 ? "PHASE IMBALANCE" : panels.some((p) => p.kw / p.max > 0.9) ? "Panel near limit" : "Normal";
  els.weatherKpi.textContent = `${state.weather.temp.toFixed(0)}°F`;
  els.weatherWarnKpi.textContent = `${Math.round(state.weather.rain * 100)}% rain · ${state.weather.wind.toFixed(0)} mph · lightning ${state.weather.lightning.toFixed(1)} mi`;
  els.profitKpi.textContent = fmtMoney(profit);
  els.moneyKpi.textContent = `Revenue ${fmtMoney(state.money.revenue)}`;
  els.incidentKpi.textContent = `${open.length} Open`;
  els.criticalKpi.textContent = critical.length ? `${critical.length} critical` : "No criticals";
}

function renderVenueMap() {
  const architectureHtml = buildMapArchitecture();
  const moverHtml = buildPopulationDots();
  els.venueMap.innerHTML = architectureHtml + rooms.map((room) => {
    const runtime = roomRuntime.get(room.id);
    const density = densityFrom(runtime.occupancy, room);
    const hasIncident = runtime.incidents.some((id) => incidentById(id)?.status !== "RESOLVED");
    const compact = room.w < 7 || room.h < 5 ? "compact-room" : "";
    return `<button type="button" class="room ${compact} ${groupSlug(room.group)} ${cssDensity(density)} ${hasIncident ? "incident" : ""} ${state.selectedRoomId === room.id ? "selected" : ""}"
      style="left:${room.x}%;top:${room.y}%;width:${room.w}%;height:${room.h}%"
      data-room="${room.id}">
      <span class="room-name">${room.name}</span>
      <span class="room-meta"><span>${fmtNumber(runtime.occupancy)}</span><span>${runtime.temp.toFixed(0)}°</span></span>
    </button>`;
  }).join("") + moverHtml;
}

function groupSlug(group) {
  return group.toLowerCase().replace(/\s+/g, "-");
}

function buildMapArchitecture() {
  return `
    <i class="map-zone concourse-ring"></i>
    <i class="map-zone bowl-shell"></i>
    <i class="map-zone public-apron"></i>
    <i class="map-zone boh-strip"></i>
    <i class="map-zone ops-yard"></i>
    <i class="map-zone truck-yard"></i>
    <i class="corridor main-spine"></i>
    <i class="corridor north-spine"></i>
    <i class="corridor south-spine"></i>
    <i class="corridor bowl-cross"></i>
    <i class="corridor bowl-cross lower"></i>
    <i class="corridor service-tunnel"></i>
    <i class="corridor boh-hall"></i>
    <i class="corridor entry-lanes"></i>
    <i class="corridor service-road"></i>
    <i class="garage-lane north"></i>
    <i class="garage-lane south"></i>
    <i class="dock-stripe"></i>
    <i class="dock-stripe two"></i>
    <i class="door main-entry"></i>
    <i class="door vip-door"></i>
    <i class="door dock-door ${state.dockDoorsOpen ? "open" : ""}"></i>
    <i class="door west-portal"></i>
    <i class="door east-portal"></i>
    <i class="door north-portal"></i>
    <i class="door south-portal"></i>
    <i class="door stage-door"></i>
    ${buildStageLightBeams()}
    <span class="route-label entry">Public entry flow</span>
    <span class="route-label service">Service road / load path</span>
    <span class="route-label egress">Exit banks</span>
    <span class="map-label bowl">Arena Bowl</span>
    <span class="map-label lobby">Entry / Public</span>
    <span class="map-label boh">Backstage Hall</span>
    <span class="map-label ops">Plant / Yard</span>
  `;
}

function buildStageLightBeams() {
  const active = ["SOUND CHECK", "OPENER", "HEADLINER", "ENCORE"].includes(phase());
  const count = state.production.lightingNodeFault ? 3 : active ? 8 : state.crewDeployed ? 2 : 0;
  if (!count) return "";
  return `<div class="stage-beam-layer ${active ? "active-show" : "worklight"} ${state.production.lightingNodeFault ? "fault" : ""}" aria-hidden="true">
    ${Array.from({ length: count }, (_, i) => `<i class="stage-beam b${i + 1}"></i>`).join("")}
    ${Array.from({ length: 8 }, (_, i) => `<i class="fixture-head f${i + 1}"></i>`).join("")}
    <i class="stage-haze"></i>
  </div>`;
}

function buildPopulationDots() {
  return [
    buildFlowDots("queue", state.crowd.outsideQueue, [{ x: 1.5, y: 33 }, { x: 10, y: 33 }, { x: 18, y: 33 }, { x: 18, y: 50 }], 70, 115, { action: "SCAN", speed: 0.18 }),
    buildFlowDots("public-dot", state.crowd.lobby + state.crowd.concourse, [{ x: 18, y: 50 }, { x: 28, y: 50 }, { x: 51, y: 15 }, { x: 81, y: 50 }, { x: 51, y: 91 }, { x: 28, y: 50 }], 82, 90, { action: "ENTER", speed: 0.13 }),
    buildFlowDots("public-dot", state.crowd.seatsFloor, [{ x: 45, y: 40 }, { x: 56, y: 53 }, { x: 46, y: 68 }, { x: 34, y: 54 }, { x: 45, y: 40 }], 58, 150, { action: "SEAT", speed: 0.09 }),
    buildGuestErrandDots(),
    buildStaffDeploymentDots(),
    buildCrewTaskDots(),
    buildLoadInDots(),
    buildBandDots(),
    buildBreakDots(),
    buildWorkOrderDots(),
    buildBadGuestDots(),
    buildFlowDots("egress-dot", state.crowd.egress + (phase() === "EGRESS" ? state.crowd.seatsFloor * 0.25 : 0), [{ x: 47, y: 54 }, { x: 80, y: 72 }, { x: 58, y: 97 }, { x: 22, y: 72 }, { x: 8, y: 54 }], 68, 100, { action: "EXIT", speed: 0.22, actionPortion: 0.16 }),
    buildRoomDots()
  ].join("");
}

function buildGuestErrandDots() {
  if (state.crowd.attendance < 250) return "";
  const p = phase();
  const concessionBoost = p === "CHANGEOVER" ? 1.9 : p === "DOORS" || p === "OPENER" ? 1.15 : 0.55;
  const restroomBoost = p === "CHANGEOVER" ? 2.1 : p === "EGRESS" ? 1.25 : 0.7;
  const base = state.crowd.attendance * 0.065 + state.guestErrandLoad * 8;
  const toConcessions = [{ x: 47, y: 54 }, { x: 45, y: 40 }, { x: 51, y: 16 }, { x: 81, y: 16 }, { x: 90, y: 27 }];
  const toRestrooms = [{ x: 47, y: 54 }, { x: 55, y: 40 }, { x: 78, y: 40 }, { x: 88, y: 16 }];
  const toMerch = [{ x: 40, y: 68 }, { x: 29, y: 68 }, { x: 28, y: 50 }, { x: 16, y: 50 }, { x: 15, y: 16 }];
  const backToSeats = [{ x: 90, y: 27 }, { x: 80, y: 50 }, { x: 56, y: 68 }, { x: 46, y: 58 }];
  return [
    buildFlowDots("guest-concession", base * concessionBoost, toConcessions, 24, 55, { action: "BUY", speed: 0.17, actionPortion: 0.35, vanishPortion: 0.08 }),
    buildFlowDots("guest-restroom", base * restroomBoost, toRestrooms, 22, 58, { action: "REST", speed: 0.16, actionPortion: 0.38, vanishPortion: 0.08 }),
    buildFlowDots("guest-merch", base * 0.55, toMerch, 12, 65, { action: "MERCH", speed: 0.13, actionPortion: 0.3, vanishPortion: 0.1 }),
    buildFlowDots("guest-return", base * 0.85, backToSeats, 18, 70, { action: "BACK", speed: 0.15, actionPortion: 0.12, vanishPortion: 0.08 })
  ].join("");
}

function buildBreakDots() {
  if (!state.breakActive) return "";
  const toBreak = [{ x: 68, y: 55 }, { x: 79, y: 52 }, { x: 79, y: 10.8 }, { x: 49, y: 10.8 }, { x: 49, y: 6 }];
  const fromBreak = [...toBreak].reverse();
  if (state.breakStatus === "TO BREAK") {
    return buildFlowDots("break", 900, toBreak, 18, 35, { action: "BREAK", speed: 0.18, actionPortion: 0.12, vanishPortion: 0.05 });
  }
  if (state.breakStatus === "ON BREAK") {
    return buildFlowDots("break", 1400, [{ x: 47, y: 6 }, { x: 52, y: 6 }, { x: 50, y: 8 }, { x: 47, y: 6 }], 24, 50, { action: "EAT", speed: 0.04, actionPortion: 0.75, vanishPortion: 0.02 });
  }
  if (state.breakStatus === "RETURNING") {
    return buildFlowDots("break", 900, fromBreak, 18, 35, { action: "BACK", speed: 0.18, actionPortion: 0.12, vanishPortion: 0.05 });
  }
  return "";
}

function serviceActivity() {
  if (!state.crewDeployed) return 0;
  const activePhase = ["LOAD-IN", "SETUP", "SOUND CHECK", "CHANGEOVER", "LOAD-OUT"].includes(phase());
  return activePhase ? 520 : 130;
}

function buildStaffDeploymentDots() {
  if (!state.crewDeployed) return "";
  const entry = { x: 3, y: 23.5 };
  const intake = { x: 10, y: 10.8 };
  const routes = [
    ["Security", "security", [{ x: entry.x, y: entry.y }, intake, { x: 59, y: 10.8 }, { x: 60, y: 5 }], "SEC"],
    ["Ushers", "ushers", [{ x: entry.x, y: entry.y }, intake, { x: 38, y: 10.8 }, { x: 38, y: 39 }, { x: 48, y: 41 }], "USH"],
    ["Guest Services", "guest-services", [{ x: entry.x, y: entry.y }, intake, { x: 18, y: 32 }, { x: 16, y: 48 }], "GSR"],
    ["Box Office", "box-office", [{ x: entry.x, y: entry.y }, intake, { x: 8, y: 16 }], "BOX"],
    ["Medical", "medical", [{ x: entry.x, y: entry.y }, intake, { x: 70, y: 10.8 }, { x: 70, y: 5 }], "MED"],
    ["Custodial", "custodial", [{ x: entry.x, y: entry.y }, intake, { x: 50, y: 10.8 }, { x: 79, y: 52 }, { x: 80, y: 72 }], "CUST"],
    ["Production", "production", [{ x: entry.x, y: entry.y }, intake, { x: 38, y: 6 }, { x: 79, y: 52 }, { x: 68, y: 54 }], "PROD"],
    ["Stagehands", "stagehands", [{ x: entry.x, y: entry.y }, intake, { x: 20, y: 78 }, { x: 65, y: 78 }, { x: 67, y: 55 }], "HAND"],
    ["Electricians", "electricians", [{ x: entry.x, y: entry.y }, intake, { x: 79, y: 52 }, { x: 91, y: 39 }], "PWR"],
    ["IT", "it", [{ x: entry.x, y: entry.y }, intake, { x: 79, y: 10.8 }, { x: 94, y: 16 }], "IT"],
    ["Catering", "catering", [{ x: entry.x, y: entry.y }, intake, { x: 49, y: 6 }], "CAT"]
  ];
  const intakeBoost = state.staffIntake < 100 ? 1.3 : 0.22;
  return routes.map(([team, slug, path, action]) => {
    const count = staff[team]?.checkedIn || 0;
    return buildFlowDots(`staff staff-${slug}`, count * 16 * intakeBoost, path, 8, 26, {
      action: state.staffIntake < 100 ? "INTAKE" : action,
      speed: state.staffIntake < 100 ? 0.2 : 0.075,
      actionPortion: state.staffIntake < 100 ? 0.2 : 0.08,
      vanishPortion: 0.08
    });
  }).join("");
}

function buildCrewTaskDots() {
  if (!state.crewDeployed) return "";
  const activeTasks = state.crewTasks.filter((task) => task.status === "ACTIVE" || task.progress > 0 && task.progress < 100);
  const taskRoutes = {
    "Warehouse Prep": ["production", [{ x: 37, y: 6 }, { x: 76, y: 6 }, { x: 78, y: 10.8 }, { x: 79, y: 52 }], "PREP"],
    "Truck Load": ["stagehands", [{ x: 10, y: 91 }, { x: 10, y: 77 }, { x: 18, y: 78 }, { x: 20, y: 76 }], "LOAD"],
    "Load-In Cases": ["stagehands", [{ x: 10, y: 77 }, { x: 20, y: 78 }, { x: 55, y: 78 }, { x: 68, y: 58 }], "PUSH"],
    "Stage Build": ["stagehands", [{ x: 20, y: 78 }, { x: 55, y: 78 }, { x: 68, y: 58 }, { x: 68, y: 50 }], "BUILD"],
    "Power Deployment": ["electricians", [{ x: 91, y: 39 }, { x: 84, y: 52 }, { x: 72, y: 58 }, { x: 67, y: 54 }], "PWR"],
    "Rigging Prep": ["production", [{ x: 89, y: 6 }, { x: 79, y: 12 }, { x: 79, y: 52 }, { x: 68, y: 45 }], "RIG"],
    "Lighting Hang/Cable": ["production", [{ x: 76, y: 6 }, { x: 79, y: 52 }, { x: 72, y: 68 }, { x: 67, y: 70 }], "LX"],
    "PA + Stage Audio": ["production", [{ x: 76, y: 6 }, { x: 79, y: 52 }, { x: 68, y: 35 }, { x: 67, y: 30 }], "AUDIO"],
    "Video Deployment": ["it", [{ x: 94, y: 16 }, { x: 79, y: 52 }, { x: 68, y: 54 }, { x: 46, y: 58 }], "VIDEO"],
    "FOH + Network Build": ["it", [{ x: 94, y: 16 }, { x: 79, y: 52 }, { x: 46, y: 58 }, { x: 67, y: 54 }], "NET"],
    "Patch + System Config": ["production", [{ x: 46, y: 58 }, { x: 55, y: 78 }, { x: 72, y: 58 }, { x: 67, y: 54 }], "PATCH"],
    "Preset": ["ushers", [{ x: 60, y: 5 }, { x: 79, y: 52 }, { x: 55, y: 40 }, { x: 46, y: 58 }], "CLEAR"],
    "Show Call": ["production", [{ x: 46, y: 58 }, { x: 67, y: 54 }, { x: 68, y: 35 }], "CUE"],
    "Strike": ["stagehands", [{ x: 68, y: 58 }, { x: 55, y: 78 }, { x: 20, y: 78 }, { x: 10, y: 77 }], "STRIKE"],
    "Truck Pack": ["stagehands", [{ x: 68, y: 58 }, { x: 55, y: 78 }, { x: 20, y: 78 }, { x: 10, y: 91 }], "PACK"],
    "Venue Sweep": ["custodial", [{ x: 81, y: 72 }, { x: 51, y: 91 }, { x: 28, y: 50 }, { x: 16, y: 48 }], "SWEEP"]
  };
  return activeTasks.slice(0, 7).map((task) => {
    const [slug, path, action] = taskRoutes[task.name] || ["production", [{ x: 12, y: 11 }, { x: 79, y: 52 }, { x: 67, y: 54 }], "WORK"];
    const volume = 140 + task.progress * 3 + serviceActivity() * 0.12;
    return buildFlowDots(`staff staff-${slug}`, volume, path, 7, 42, {
      action,
      speed: 0.13,
      actionPortion: 0.22,
      vanishPortion: 0.08
    });
  }).join("");
}

function buildLoadInDots() {
  if (!state.crewDeployed) return "";
  const p = phase();
  if (!["LOAD-IN", "SETUP", "CHANGEOVER", "LOAD-OUT"].includes(p)) return "";
  const truckPath = [{ x: 4, y: 95 }, { x: 11, y: 95 }, { x: 11, y: 83 }, { x: 10, y: 77 }];
  const forkliftPath = p === "LOAD-OUT"
    ? [{ x: 67, y: 55 }, { x: 72, y: 58 }, { x: 79, y: 60 }, { x: 55, y: 78 }, { x: 22, y: 78 }, { x: 10, y: 77 }]
    : [{ x: 10, y: 77 }, { x: 22, y: 78 }, { x: 55, y: 78 }, { x: 78, y: 78 }, { x: 79, y: 60 }, { x: 72, y: 58 }, { x: 67, y: 55 }, { x: 72, y: 58 }, { x: 79, y: 60 }, { x: 55, y: 78 }, { x: 22, y: 78 }, { x: 10, y: 77 }];
  const truckVolume = ["LOAD-IN", "LOAD-OUT"].includes(p) ? state.trucksArrived * 95 : state.trucksArrived * 24;
  const liftVolume = state.forkliftsActive * 135 + (p === "LOAD-IN" ? state.unloadProgress * 3 : p === "SETUP" ? state.setupProgress * 2 : p === "CHANGEOVER" ? state.production.changeoverProgress * 2 : state.strikeProgress * 3);
  const trucks = buildFlowDots("truck", truckVolume, truckPath, 12, 38, { action: state.dockDoorsOpen ? "TRUCK" : "WAIT", speed: 0.07, actionPortion: 0.34 });
  const forklifts = buildFlowDots("forklift", liftVolume, forkliftPath, 18, 32, { action: p === "LOAD-OUT" ? "PACK" : p === "CHANGEOVER" ? "SWAP" : p === "SETUP" ? "GEAR" : "UNLOAD", speed: 0.16, actionPortion: 0.26 });
  return buildDockParking() + trucks + forklifts;
}

function buildDockParking() {
  const parkedTrucks = clamp(Math.round(state.trucksArrived / 3), 0, 5);
  const parkedForks = clamp(state.forkliftsActive, 0, 4);
  const trucks = Array.from({ length: parkedTrucks }, (_, i) => {
    const x = 4.7 + i * 2.1;
    const y = 73.3 + (i % 2) * 3.4;
    return `<i class="mover truck parked action" data-action="PARK" style="left:${x}%;top:${y}%"></i>`;
  }).join("");
  const forklifts = Array.from({ length: parkedForks }, (_, i) => {
    const x = 14.1 + (i % 2) * 1.2;
    const y = 74.2 + Math.floor(i / 2) * 2.6;
    return `<i class="mover forklift parked action" data-action="IDLE" style="left:${x}%;top:${y}%"></i>`;
  }).join("");
  return trucks + forklifts;
}

function buildBandDots() {
  if (state.band.status === "OFFSITE") return "";
  const paths = {
    BANDING: [{ x: 18, y: 6 }, { x: 20, y: 8 }, { x: 16, y: 8 }, { x: 18, y: 6 }],
    ARRIVING: [{ x: 16, y: 90 }, { x: 12, y: 84 }, { x: 11, y: 77 }, { x: 20, y: 78 }, { x: 45, y: 78 }, { x: 66, y: 58 }],
    "BAND SETUP": [{ x: 12, y: 84 }, { x: 20, y: 78 }, { x: 55, y: 78 }, { x: 72, y: 58 }, { x: 67, y: 54 }],
    "SOUND CHECK": [{ x: 52, y: 8 }, { x: 66, y: 10.8 }, { x: 79, y: 52 }, { x: 67, y: 54 }],
    HOLDING: [{ x: 48, y: 8 }, { x: 42, y: 10.8 }, { x: 10, y: 6 }],
    "STAGE READY": [{ x: 10, y: 6 }, { x: 42, y: 10.8 }, { x: 79, y: 52 }, { x: 67, y: 35 }],
    "ON STAGE": [{ x: 67, y: 54 }, { x: 64, y: 50 }, { x: 67, y: 58 }, { x: 70, y: 54 }],
    "OFF STAGE": [{ x: 67, y: 54 }, { x: 79, y: 52 }, { x: 54, y: 10.8 }, { x: 20, y: 6 }]
  };
  const action = state.band.status === "BANDING" ? "JAM" : state.band.status === "BAND SETUP" ? "BACKLINE" : state.band.status === "SOUND CHECK" ? "CHECK" : state.band.status === "HOLDING" ? "GREEN" : state.band.status === "ON STAGE" ? "PLAY" : "BAND";
  return buildFlowDots("band", 700, paths[state.band.status] || paths.ARRIVING, 7, 90, { action, speed: state.band.status === "ON STAGE" ? 0.05 : 0.12, actionPortion: 0.38 });
}

function buildBadGuestDots() {
  return state.badGuests.map((guest, index) => {
    const source = rooms.find((room) => room.id === guest.sourceId);
    const exit = rooms.find((room) => room.id === guest.exitId);
    if (!source || !exit) return "";
    const sourcePoint = roomCenter(source);
    const exitPoint = roomCenter(exit);
    const securityStart = crewStartFor("Security");
    const responsePath = routeThroughHall(securityStart, sourcePoint);
    const escortPath = routeThroughHall(sourcePoint, exitPoint);
    if (guest.stage === "ACTING OUT") {
      return `<i class="mover bad-guest action" data-action="BAD" style="left:${sourcePoint.x + index}%;top:${sourcePoint.y + index}%"></i>`;
    }
    if (guest.stage === "SECURITY EN ROUTE") {
      const t = clamp((guest.progress - 24) / 24, 0, 1);
      const sec = pointOnPath(responsePath, t);
      return `<i class="mover bad-guest action" data-action="BAD" style="left:${sourcePoint.x + index}%;top:${sourcePoint.y + index}%"></i>
        <i class="mover staff staff-security action" data-action="SEC" style="left:${sec.x}%;top:${sec.y}%"></i>`;
    }
    if (guest.stage === "ESCORTING") {
      const t = clamp((guest.progress - 48) / 44, 0, 1);
      const point = pointOnPath(escortPath, t);
      return `<i class="mover escort action" data-action="OUT" style="left:${point.x}%;top:${point.y}%"></i>
        <i class="mover staff staff-security action" data-action="SEC" style="left:${point.x + 1.1}%;top:${point.y + 0.7}%"></i>`;
    }
    return "";
  }).join("");
}

function buildWorkOrderDots() {
  return state.workOrders.filter((order) => order.status !== "DONE").map((order, index) => {
    const destination = rooms.find((room) => room.id === order.destinationId) || rooms.find((room) => room.id === "foh");
    const incident = incidentById(order.incidentId);
    const start = crewStartFor(order.crew);
    const support = supportPointForOrder(order, incident);
    const path = order.status === "GETTING KIT"
      ? routeThroughHall(start, support)
      : routeThroughHall(support, roomCenter(destination));
    const travelT = order.status === "EN ROUTE"
      ? clamp(order.progress / 24, 0, 1)
      : order.status === "GETTING KIT"
        ? clamp((order.progress - 24) / 22, 0, 1)
        : clamp((order.progress - 46) / 54, 0, 1);
    const point = pointOnPath(path, travelT);
    const action = shortWorkOrderAction(order);
    return `<i class="mover tech action" data-action="${action}" style="left:${point.x + index * 0.4}%;top:${point.y + index * 0.35}%"></i>`;
  }).join("");
}

function supportPointForOrder(order, incident) {
  const room = rooms.find((item) => item.id === supportRoomIdForOrder(order, incident)) || rooms.find((item) => item.id === "storage");
  return roomCenter(room);
}

function supportRoomIdForOrder(order, incident) {
  const title = incident?.title.toLowerCase() || "";
  const category = incident?.category || "";
  if (title.includes("ahu") || category === "HVAC") return "hvacPlant";
  if (title.includes("panel") || title.includes("phase") || category === "Electrical") return "mainElectrical";
  if (title.includes("core") || title.includes("dante") || category === "Network") return "mdf";
  if (title.includes("concessions")) return "catering";
  if (category === "Facility") return "storage";
  if (category === "Medical") return "medical";
  if (category === "Security") return "securityOffice";
  return "storage";
}

function shortWorkOrderAction(order) {
  const incident = incidentById(order.incidentId);
  const title = incident?.title.toLowerCase() || "";
  const category = incident?.category || "";
  if (order.status === "EN ROUTE") return "GO";
  if (order.status === "GETTING KIT") return "KIT";
  if (title.includes("ahu") || category === "HVAC") return "VALVE";
  if (title.includes("panel") || title.includes("phase") || category === "Electrical") return "SHED";
  if (title.includes("concessions")) return "STOCK";
  if (title.includes("disorderly") || title.includes("guest escort")) return "OUT";
  if (title.includes("core") || title.includes("dante") || category === "Network") return "PATCH";
  if (category === "Medical") return "MED";
  if (category === "Facility") return "CLEAN";
  return order.status === "TESTING" ? "TEST" : "FIX";
}

function crewStartFor(crew) {
  if (crew === "IT") return { x: 94, y: 16 };
  if (crew === "Electricians") return { x: 91, y: 39 };
  if (crew === "Medical") return { x: 70, y: 5 };
  if (crew === "Security") return { x: 60, y: 5 };
  if (crew === "Stagehands" || crew === "Production") return { x: 38, y: 8 };
  if (crew === "Custodial") return { x: 76, y: 8 };
  return { x: 12, y: 52 };
}

function roomCenter(room) {
  return { x: room.x + room.w / 2, y: room.y + room.h / 2 };
}

function routeThroughHall(start, end) {
  const midY = end.y < 20 ? 10.8 : end.y > 72 ? 78 : 52;
  return [
    start,
    { x: start.x < 20 ? 10 : 79, y: midY },
    { x: end.x > 82 ? 84 : end.x < 20 ? 18 : end.x, y: midY },
    end
  ];
}

function buildFlowDots(kind, volume, path, maxDots, divisor, options = {}) {
  const count = clamp(Math.floor(volume / divisor), 0, maxDots);
  return Array.from({ length: count }, (_, i) => {
    const cycle = (state.simMinute * (options.speed ?? 0.16) + i / Math.max(1, count)) % 1;
    const vanishPortion = options.vanishPortion ?? 0.14;
    const actionPortion = options.actionPortion ?? 0.22;
    const travelPortion = Math.max(0.2, 1 - actionPortion - vanishPortion);
    if (cycle > travelPortion + actionPortion) return "";

    const acting = cycle > travelPortion;
    const travelT = acting ? 1 : cycle / travelPortion;
    const point = pointOnPath(path, travelT);
    const wiggle = Math.sin((state.simMinute * 2.2) + i * 1.9) * 1.5;
    const actionScatter = acting ? Math.sin(i * 3.1) * 1.4 : 0;
    const x = clamp(point.x + Math.sin(i * 2.4) * 1.2 + actionScatter, 0.8, 98);
    const y = clamp(point.y + (acting ? Math.cos(i * 2.2) * 1.1 : wiggle), 1.2, 98);
    const actionAttr = acting && options.action ? ` data-action="${options.action}"` : "";
    return `<i class="mover ${kind} ${acting ? "action" : ""}"${actionAttr} style="left:${x}%;top:${y}%"></i>`;
  }).join("");
}

function buildRoomDots() {
  return rooms.map((room, roomIndex) => {
    const runtime = roomRuntime.get(room.id);
    const density = densityFrom(runtime.occupancy, room);
    const divisor = density === "OVERCAPACITY" ? 90 : density === "HIGH" ? 115 : density === "MODERATE" ? 155 : 240;
    const maxDots = room.group === "Arena Bowl" ? 18 : room.group === "Public" ? 12 : 5;
    const count = clamp(Math.floor(runtime.occupancy / divisor), 0, maxDots);
    return Array.from({ length: count }, (_, i) => {
      const seed = (roomIndex + 1) * 97 + i * 53;
      const jitterX = ((Math.sin(seed) + 1) / 2) * 82 + 9;
      const jitterY = ((Math.cos(seed * 1.37) + 1) / 2) * 72 + 14;
      const drift = Math.sin(state.simMinute * 0.9 + seed) * 0.7;
      const x = room.x + room.w * jitterX / 100 + drift;
      const y = room.y + room.h * jitterY / 100 - drift;
      const action = roomActionFor(room);
      return `<i class="mover room-dot ${action ? "action ambient-action" : ""}" ${action ? `data-action="${action}"` : ""} style="left:${clamp(x, 1, 98)}%;top:${clamp(y, 1, 98)}%"></i>`;
    }).join("");
  }).join("");
}

function roomActionFor(room) {
  const p = phase();
  const activeOrder = activeOrderForRoom(room);
  if (activeOrder) return shortWorkOrderAction(activeOrder);
  if (room.id === "dressing1" && state.band.status === "BANDING") return "JAM";
  if (room.id === "loadingDock" || room.id === "freightElevator") return state.crewDeployed && ["LOAD-IN", "LOAD-OUT"].includes(p) ? "LOAD" : "";
  if (room.id === "stage" || room.id === "stageLeft" || room.id === "stageRight") {
    if (p === "CHANGEOVER") return "SET";
    if (["LOAD-IN", "SETUP"].includes(p)) return "BUILD";
    if (["SOUND CHECK", "OPENER", "HEADLINER", "ENCORE"].includes(p)) return "SHOW";
  }
  if (room.id === "mainLobby" || room.id === "securityLanes" || room.id === "boxOffice") return ["DOORS", "OPENER"].includes(p) ? "SCAN" : "";
  if (room.name.includes("Concessions")) return ["DOORS", "CHANGEOVER", "EGRESS"].includes(p) ? "BUY" : "";
  if (room.name.includes("Restrooms")) return p === "CHANGEOVER" ? "WAIT" : "";
  if (room.id === "floor" || room.id === "lowerBowl" || room.id === "upperBowl") return ["OPENER", "HEADLINER", "ENCORE"].includes(p) ? "WATCH" : "";
  if (room.group === "Back of House" && state.crewDeployed) return "PREP";
  return "";
}

function activeOrderForRoom(room) {
  return state.workOrders.find((order) => {
    if (order.status === "DONE") return false;
    const incident = incidentById(order.incidentId);
    const supportId = supportRoomIdForOrder(order, incident);
    return order.destinationId === room.id || supportId === room.id;
  });
}

function pointOnPath(path, t) {
  const segmentCount = path.length - 1;
  const scaled = t * segmentCount;
  const index = Math.min(segmentCount - 1, Math.floor(scaled));
  const local = scaled - index;
  const start = path[index];
  const end = path[index + 1];
  return {
    x: start.x + (end.x - start.x) * local,
    y: start.y + (end.y - start.y) * local
  };
}

function renderInspector() {
  const room = rooms.find((item) => item.id === state.selectedRoomId) || rooms[0];
  const runtime = roomRuntime.get(room.id);
  const density = densityFrom(runtime.occupancy, room);
  const openRoomIncidents = runtime.incidents.map(incidentById).filter((incident) => incident && incident.status !== "RESOLVED");
  els.roomTitle.textContent = room.name;
  els.selectedRoomPill.textContent = `${room.name} selected`;
  els.roomDensity.textContent = density;
  els.roomDensity.className = `pill ${density === "OVERCAPACITY" ? "critical" : density === "HIGH" ? "warning" : ""}`;
  els.roomInspector.innerHTML = [
    stat("Group", room.group),
    stat("Occupancy", `${fmtNumber(runtime.occupancy)} / ${fmtNumber(room.cap)}`, density === "OVERCAPACITY" ? "critical" : density === "HIGH" ? "warning" : ""),
    stat("Current Activity", roomActionFor(room) || "MONITOR"),
    stat("Operator Move", roomRecommendation(room, runtime, density)),
    stat("Temperature", `${runtime.temp.toFixed(1)}°F`),
    stat("Access", room.access),
    stat("Power", `${runtime.power.toFixed(1)} kW`),
    stat("Network", runtime.network, runtime.network === "OK" ? "" : "warning"),
    stat("Equipment", room.equipment.join(", ")),
    stat("Incidents", openRoomIncidents.length ? openRoomIncidents.map((item) => item.id).join(", ") : "None")
  ].join("");
}

function roomRecommendation(room, runtime, density) {
  if (density === "OVERCAPACITY") return "Dispatch crowd control and open adjacent doors";
  if (runtime.network !== "OK") return "Send IT and check redundant path";
  if (runtime.temp > 76) return "Increase cooling or reduce door-open time";
  if (room.id === "loadingDock" && state.crewDeployed && state.unloadProgress < 100) return state.dockDoorsOpen ? "Keep forklifts cycling to service road" : "Open dock doors";
  if (room.id === "securityLanes" && state.crowd.outsideQueue > 500) return "Open lane or reassign security";
  if (room.name.includes("Concessions") && concessions.waiting > 60) return "Open stand and add POS staff";
  if (room.id === "stage" && phase() === "CHANGEOVER") return "Push stagehands to backline and line check";
  if (room.group === "Back of House" && !state.crewDeployed) return "Waiting for crew call";
  return "Hold coverage and monitor telemetry";
}

function stat(label, value, extra = "") {
  return `<div class="stat-card ${extra}"><span class="eyebrow">${label}</span><strong>${value}</strong></div>`;
}

function renderCrowd() {
  const steps = [
    ["Outside Queue", state.crowd.outsideQueue, 1800],
    ["Security", state.crowd.security, 600],
    ["Ticket Scan", state.crowd.ticketScan, 500],
    ["Lobby", state.crowd.lobby, 900],
    ["Concourse", state.crowd.concourse, 2600],
    ["Seats/Floor", state.crowd.seatsFloor, 8500]
  ];
  els.crowdPipeline.innerHTML = steps.map(([name, value, cap]) => {
    const fill = clamp(value / cap * 100, 3, 100);
    return `<div class="pipe-step" style="--fill:${fill}%">
      <span class="eyebrow">${name}</span>
      <strong>${fmtNumber(value)}</strong>
      <span class="microcopy">${densityText(value / cap)}</span>
    </div>`;
  }).join("");
  const securityThroughput = state.securityLanes * 16 * staffingCoverage("Security") * (staff.Security.checkedIn / staff.Security.scheduled);
  const scanLimit = state.admissions.mode === "METERED" ? Math.min(140 * staffingCoverage("Box Office"), state.admissions.meteredMax) : state.admissions.mode === "OPEN" ? 140 * staffingCoverage("Box Office") : 0;
  const avgWait = state.totalWaitMinutes / Math.max(1, state.waitSamples);
  els.crowdRates.innerHTML = [
    stat("Arrival", `${phaseArrivalRate().toFixed(0)} people/min`),
    stat("Security throughput", `${securityThroughput.toFixed(0)} /min`),
    stat("Ticket scan", `${scanLimit.toFixed(0)} /min`, scanLimit === 0 && ["DOORS", "OPENER"].includes(phase()) ? "warning" : ""),
    stat("Average entry wait", `${Math.round(avgWait)}m ${Math.round((avgWait % 1) * 60)}s`)
  ].join("");
}

function renderSetup() {
  const prediction = setupPrediction();
  els.setupPanel.innerHTML = `
    ${stat("Projected Attendance", fmtNumber(state.admissions.projectedAttendance))}
    ${stat("Security Scheduled", `${staff.Security.scheduled} / rec ${prediction.recommendedSecurity}`, staff.Security.scheduled < prediction.recommendedSecurity ? "warning" : "")}
    ${stat("Entry Capacity", `${prediction.entryCapacity}/min`)}
    ${stat("Peak Arrival", `${prediction.peakArrival}/min`)}
    ${stat("Projected Wait", prediction.waitLabel, prediction.waitSeverity)}
    ${stat("Mode", `${state.scenario} · ${state.difficulty}`)}
  `;
  els.scenarioButtons.innerHTML = scenarioPresets.map((scenario) => (
    `<button type="button" data-scenario="${scenario.name}" class="${state.scenario === scenario.name ? "active" : ""}">${scenario.name}</button>`
  )).join("") + difficultyModes.map((mode) => (
    `<button type="button" data-difficulty="${mode}" class="${state.difficulty === mode ? "active" : ""}">${mode}</button>`
  )).join("");
}

function setupPrediction() {
  const peakArrival = Math.round(112 * clamp(state.admissions.ticketsSold / capacity, 0.7, 1.25) * (state.scenario === "Overbooked" ? 1.45 : state.scenario === "Sold Out" ? 1.28 : 1));
  const entryCapacity = Math.round(state.securityLanes * 16 * staffingCoverage("Security") * (staff.Security.checkedIn / staff.Security.scheduled));
  const recommendedSecurity = Math.ceil(peakArrival / 9.5);
  const projectedWait = peakArrival <= entryCapacity ? 7 : Math.min(90, Math.round((peakArrival - entryCapacity) / Math.max(1, entryCapacity) * 42 + 10));
  const waitLabel = projectedWait > 55 ? "CATASTROPHIC" : projectedWait > 28 ? `${projectedWait}m BAD` : `${projectedWait}m`;
  const waitSeverity = projectedWait > 55 ? "critical" : projectedWait > 28 ? "warning" : "";
  return { peakArrival, entryCapacity, recommendedSecurity, projectedWait, waitLabel, waitSeverity };
}

function densityText(ratio) {
  if (ratio > 1) return "OVERCAPACITY";
  if (ratio > 0.72) return "HIGH";
  if (ratio > 0.34) return "MODERATE";
  return "LOW";
}

function renderStaff() {
  els.staffTable.innerHTML = `<div class="row header"><span>Team</span><span>Scheduled</span><span>Checked In</span><span>Assigned</span><span>Available</span></div>` +
    Object.entries(staff).map(([name, group]) => {
      const available = Math.max(0, group.checkedIn - group.assigned);
      const missing = Math.max(0, group.scheduled - group.checkedIn);
      const slug = staffSlug(name);
      return `<div class="row staff-row ${missing ? "short" : ""}"><span><i class="staff-chip staff-${slug}"></i>${name}${missing ? ` · ${missing} missing` : ""}</span><span>${group.scheduled} <button class="mini-btn" type="button" data-staff-adjust="${name}:1">+</button><button class="mini-btn" type="button" data-staff-adjust="${name}:-1">-</button></span><span>${group.checkedIn}</span><span>${group.assigned}</span><span>${available}</span></div>`;
    }).join("");
}

function staffSlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function adjustScheduledStaff(team, delta) {
  const group = staff[team];
  if (!group) return;
  group.scheduled = clamp(group.scheduled + delta, 0, 120);
  group.checkedIn = clamp(group.checkedIn + delta, 0, group.scheduled);
  group.assigned = clamp(group.assigned + delta, 0, group.checkedIn);
  state.money.cost += delta > 0 ? staffRates[team] * 4 : 0;
  addDispatch("STAFFING", `${team} scheduled ${delta > 0 ? "increased" : "reduced"} to ${group.scheduled}.`);
  renderAll();
}

function applyScenario(name) {
  const scenario = scenarioPresets.find((item) => item.name === name);
  if (!scenario || state.crewDeployed || state.admissions.arrived > 0) {
    addDispatch("CONTROL", "Scenario presets are locked once crew or guests are moving.");
    renderAll();
    return;
  }
  state.scenario = scenario.name;
  state.admissions.ticketsSold = scenario.tickets;
  state.admissions.projectedAttendance = scenario.tickets;
  state.weather = { ...state.weather, ...scenario.weather };
  staff.Security.scheduled = scenario.security;
  staff.Security.checkedIn = Math.max(0, scenario.security - Math.round(scenario.security * 0.08));
  staff.Security.assigned = Math.max(0, staff.Security.checkedIn - 3);
  staff["Guest Services"].scheduled = scenario.guestServices;
  staff["Guest Services"].checkedIn = Math.max(0, scenario.guestServices - 2);
  staff["Guest Services"].assigned = Math.max(0, staff["Guest Services"].checkedIn - 3);
  staff["Box Office"].scheduled = scenario.boxOffice;
  staff["Box Office"].checkedIn = Math.max(0, scenario.boxOffice - 1);
  staff["Box Office"].assigned = Math.max(0, staff["Box Office"].checkedIn - 1);
  addDispatch("CONTROL", `Scenario loaded: ${scenario.name}. ${scenario.note}`);
  renderAll();
}

function renderNpcWork() {
  els.bandPill.textContent = `${state.band.status} · ${state.band.location}`;
  const activeTasks = state.crewTasks
    .filter((task) => task.status === "ACTIVE" || task.progress > 0 && task.progress < 100)
    .slice(0, 10);
  const activeOrders = state.workOrders.filter((order) => order.status !== "DONE");
  els.npcPanel.innerHTML = `
    <div class="npc-summary">
      ${stat("Band", `${state.band.status} · ${state.band.location}`)}
      ${stat("Instrument Load", `${Math.round(state.band.instrumentLoad)}%`)}
      ${stat("Setup Build", `${Math.round(state.setupProgress)}%`)}
      ${stat("Strike / Pack", `${Math.round(state.strikeProgress)}%`)}
      ${stat("Crew Fatigue", `${Math.round(state.crewFatigue)}%`, state.crewFatigue > 72 ? "warning" : "")}
      ${stat("Break Status", state.breakStatus, state.breakActive ? "warning" : "")}
      ${stat("Staff Intake", `${Math.round(state.staffIntake)}%`)}
      ${stat("Guest Problems", state.badGuests.filter((guest) => guest.stage !== "REMOVED").length, state.badGuests.some((guest) => guest.stage !== "REMOVED") ? "warning" : "")}
      ${stat("Active Fix Crews", activeOrders.length)}
      ${stat("Cases", `${state.unloadedCases} scanned`)}
    </div>
    <div class="npc-columns">
      <div>
        <span class="eyebrow">Crew Task Board</span>
        <div class="task-list compact-tasks">
          ${activeTasks.map(renderCrewTask).join("") || "<div class=\"stat-card\"><strong>No active tasks</strong><span class=\"microcopy\">Send crew in to start the day.</span></div>"}
        </div>
      </div>
      <div>
        <span class="eyebrow">Assigned Problem Fixes</span>
        <div class="task-list compact-tasks">
          ${activeOrders.map(renderWorkOrder).join("") || "<div class=\"stat-card\"><strong>No crews dispatched</strong><span class=\"microcopy\">Assign an incident to send a technician.</span></div>"}
        </div>
      </div>
    </div>
    <div>
      <span class="eyebrow">Parts / Repair Stores</span>
      <div class="parts-grid">
        ${Object.entries(state.parts).map(([name, qty]) => `<span class="${qty <= 0 ? "empty" : ""}">${name}: ${qty}</span>`).join("")}
      </div>
    </div>`;
}

function renderCrewTask(task) {
  return `<div class="task-line"><label><span>${task.name}</span><span>${Math.round(task.progress)}%</span></label><progress max="100" value="${task.progress}"></progress><span class="microcopy">${task.dept} · ${task.owner} · ${task.status}</span></div>`;
}

function renderWorkOrder(order) {
  const incident = incidentById(order.incidentId);
  const destination = rooms.find((room) => room.id === order.destinationId);
  return `<div class="task-line"><label><span>${order.crew} → ${destination?.name || "Venue"}</span><span>${Math.round(order.progress)}%</span></label><progress max="100" value="${order.progress}"></progress><span class="microcopy">${order.status} · ${order.tool}${order.part ? ` · ${order.part} ${order.partAcquired ? "loaded" : "needed"}` : ""} · ${incident?.title || order.incidentId}</span></div>`;
}

function renderElectrical() {
  const totalKw = panels.reduce((sum, panel) => sum + panel.kw, 0);
  els.utilityGrid.innerHTML = ["A", "B"].map((key) => {
    const utility = utilities[key];
    const kw = utility.online ? totalKw * (key === "A" ? 0.78 : 0.22) : 0;
    return stat(`Utility ${key}`, `${utility.online ? "ONLINE" : "FAILED"} · ${Math.round(kw)} kW`, utility.online ? "" : "critical") +
      stat(`Utility ${key} L1/L2/L3`, `${Math.round(utility.l1)}A / ${Math.round(utility.l2)}A / ${Math.round(utility.l3)}A`, phaseImbalancePct() > 18 && key === "A" ? "warning" : "") +
      stat(`Utility ${key} Voltage/PF`, `${utility.voltage}V · PF ${utility.pf.toFixed(2)}`);
  }).join("");
  els.panelGrid.innerHTML = panels.map((panel) => {
    const load = panel.kw / panel.max * 100;
    const klass = load > 96 ? "danger" : load > 86 ? "warn" : "";
    return `<div class="stat-card ${load > 96 ? "critical" : load > 86 ? "warning" : ""}">
      <span class="eyebrow">${panel.name}</span>
      <strong>${Math.round(load)}% · ${Math.round(panel.kw)} kW</strong>
      <div class="load-meter ${klass}"><span style="--load:${clamp(load, 0, 100)}%"></span></div>
      <span class="microcopy">${panel.critical ? "Critical bus" : "Shed-able load"}</span>
    </div>`;
  }).join("");
  els.backupGrid.innerHTML = [backup.gen1, backup.gen2].map((gen) => stat(gen.label, `${gen.state} · ${gen.fuel.toFixed(0)}% fuel`, gen.state === "FAULT" ? "critical" : gen.state === "ONLINE" ? "warning" : "")).join("") +
    [backup.upsA, backup.upsB].map((ups) => stat(ups.label, `${ups.charge.toFixed(0)}% · load ${ups.load}% · ${runtimeText(ups.runtime)}`)).join("");
}

function runtimeText(minutes) {
  const mins = Math.floor(minutes);
  const sec = Math.round((minutes - mins) * 60);
  return `${mins}:${String(sec).padStart(2, "0")}`;
}

function renderNetwork() {
  const nodes = [
    ["ISP 1", 8, 12], ["ISP 2", 8, 30], ["CORE-SW-A", 36, 18], ["CORE-SW-B", 58, 18],
    ["Production", 45, 42], ["Dante", 26, 56], ["Lighting", 42, 68], ["POS", 62, 48],
    ["Staff", 72, 62], ["Guest Wi-Fi", 58, 76], ["Building Controls", 22, 78]
  ];
  const lines = [
    [15, 16, 36, 22, false], [15, 34, 36, 22, false], [45, 22, 58, 22, false],
    [47, 30, 49, 42, false], [40, 30, 30, 56, state.coreAFailed], [48, 30, 46, 68, state.production.lightingNodeFault],
    [62, 30, 66, 48, false], [62, 30, 76, 62, false], [62, 30, 62, 76, false], [40, 30, 26, 78, false]
  ];
  els.networkTopo.innerHTML = lines.map(([x1, y1, x2, y2, fail]) => line(x1, y1, x2, y2, fail)).join("") +
    nodes.map(([name, x, y]) => {
      const bad = (name === "CORE-SW-A" && state.coreAFailed) || (name === "Dante" && state.production.danteLatency > 6) || (name === "Lighting" && state.production.lightingNodeFault);
      return `<div class="net-node ${bad ? "bad" : ""}" style="left:${x}%;top:${y}%">${name}</div>`;
    }).join("");
  els.networkStats.innerHTML = `<div class="row header"><span>Switch</span><span>Speed</span><span>Loss</span><span>Latency</span><span>Clients</span><span>CPU/Temp</span></div>` +
    switches.map((sw) => `<div class="row"><span>${sw.name} · ${sw.role}</span><span>${sw.speed}</span><span>${sw.online ? sw.loss.toFixed(1) : "100"}%</span><span>${sw.online ? sw.latency.toFixed(1) : "DOWN"}ms</span><span>${sw.clients}</span><span>${Math.round(sw.cpu)}% / ${Math.round(sw.temp)}°F</span></div>`).join("");
}

function line(x1, y1, x2, y2, fail) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return `<i class="net-line ${fail ? "fail" : ""}" style="left:${x1}%;top:${y1}%;width:${length}%;transform:rotate(${angle}deg)"></i>`;
}

function renderProduction() {
  const tabs = ["AUDIO", "LIGHTING", "VIDEO", "STAGE"];
  els.productionTabs.innerHTML = tabs.map((tab) => `<button type="button" data-production="${tab}" class="${state.selectedProduction === tab ? "active" : ""}">${tab}</button>`).join("");
  els.productionPanel.innerHTML = {
    AUDIO: renderAudio(),
    LIGHTING: renderLighting(),
    VIDEO: renderVideo(),
    STAGE: renderStage()
  }[state.selectedProduction];
}

function renderAudio() {
  const rf = [
    ["VOX 1", "-51 dBm", "-12 dB", "84%"],
    ["VOX 2", state.production.rfInterference ? "-78 dBm" : "-64 dBm", state.production.rfInterference ? "DROP" : "-18 dB", "62%"],
    ["GTR RF", "-58 dBm", "-20 dB", "71%"],
    ["HOST", "-49 dBm", "-10 dB", "91%"]
  ];
  return `<div class="production-grid">
    ${stat("Console", "ONLINE")}
    ${stat("Stage Rack", state.production.danteLatency > 6 ? "CLOCK WARN" : "LOCKED", state.production.danteLatency > 6 ? "warning" : "")}
    ${stat("Dante Primary", `${state.production.danteLatency.toFixed(1)}ms · ${state.production.danteLoss.toFixed(1)}% loss`, state.production.danteLatency > 6 ? "warning" : "")}
    ${stat("Dante Secondary", "1.8ms · 0.0% loss")}
    ${stat("PA", "L/R/Sub online")}
    ${stat("DSP", "Scenes locked")}
  </div>
  <div class="data-table rf-table">
    <div class="row header"><span>Channel</span><span>RF</span><span>Audio</span><span>Battery</span></div>
    ${rf.map((row) => `<div class="row"><span>${row[0]}</span><span>${row[1]}</span><span>${row[2]}</span><span>${row[3]}</span></div>`).join("")}
  </div>`;
}

function renderLighting() {
  const offline = state.production.lightingNodeFault ? 37 : 2;
  return `<div class="production-grid">
    ${stat("Moving Wash", `${24 - Math.floor(offline * 0.12)} / 24 online`)}
    ${stat("Profile", `${12 - Math.floor(offline * 0.08)} / 12 online`)}
    ${stat("Beam", `${18 - Math.floor(offline * 0.12)} / 18 online`)}
    ${stat("LED Batten", `${32 - Math.floor(offline * 0.3)} / 32 online`)}
    ${stat("Strobe/Blinder", `${24 - Math.floor(offline * 0.18)} / 24 online`)}
    ${stat("Console", state.production.lightingNodeFault ? "NODE WARN" : "ONLINE", state.production.lightingNodeFault ? "warning" : "")}
  </div>
  <div class="data-table">
    <div class="row header"><span>Universe</span><span>Fixtures</span><span>Refresh</span><span>Packets</span><span>Node</span></div>
    ${[1, 2, 3, 4, 5, 6].map((u) => {
      const bad = state.production.lightingNodeFault && [4, 5].includes(u);
      return `<div class="row"><span>Universe ${u}</span><span>${bad ? 0 : 31 + u}</span><span>${bad ? "--" : "44 Hz"}</span><span>${bad ? "LOST" : "GOOD"}</span><span>${bad ? "OFFLINE" : `NODE-${u}`}</span></div>`;
    }).join("")}
  </div>
  <div class="button-row"><button type="button" id="killLightingNode">Kill Network Node</button><button type="button" id="restoreLightingNode">Restore Node</button></div>`;
}

function renderVideo() {
  return `<div class="production-grid">
    ${stat("Switcher", "ONLINE")}
    ${stat("Playback A", state.production.playbackAFailed ? "FAILED" : "ONLINE", state.production.playbackAFailed ? "critical" : "")}
    ${stat("Playback B", state.production.videoBackupActive ? "PROGRAM" : "READY", state.production.videoBackupActive ? "warning" : "")}
    ${stat("LED Processor", "A/B synced")}
    ${stat("LED Wall", "3840 x 1080")}
    ${stat("Input", "2160p59.94")}
    ${stat("Cameras", "8 / 8 shaded")}
    ${stat("IMAG", "ONLINE")}
    ${stat("Record / Stream", "Recording · 12 Mbps")}
  </div>
  <div class="button-row"><button type="button" id="failPlayback">Fail Playback A</button><button type="button" id="restorePlayback">Restore Playback</button></div>`;
}

function renderStage() {
  const tasks = [
    ["Deck sweep", phase() === "CHANGEOVER" ? state.production.changeoverProgress + 16 : 100],
    ["Backline roll", phase() === "CHANGEOVER" ? state.production.changeoverProgress : phase() === "HEADLINER" ? 100 : 35],
    ["Set pieces", phase() === "CHANGEOVER" ? state.production.changeoverProgress - 8 : phase() === "HEADLINER" ? 100 : 40],
    ["Line check", phase() === "CHANGEOVER" ? state.production.changeoverProgress - 22 : phase() === "HEADLINER" ? 100 : 15],
    ["Barricade check", 100]
  ];
  return `<div class="production-grid">
    ${stat("Stagehands", `${staff.Stagehands.assigned} assigned`)}
    ${stat("Deck Status", state.production.changeoverProgress >= 100 || phase() !== "CHANGEOVER" ? "CLEAR" : "ACTIVE")}
    ${stat("Changeover", `${Math.round(state.production.changeoverProgress)}%`, state.production.changeoverProgress < 70 && phase() === "CHANGEOVER" ? "warning" : "")}
    ${stat("Stage Lifts", "LOCKED")}
    ${stat("Motors", "12 / 12 online")}
    ${stat("Backline", phase() === "HEADLINER" ? "SET" : "STAGED")}
  </div>
  <div class="task-list">
    ${tasks.map(([name, value]) => `<div class="task-line"><label><span>${name}</span><span>${Math.round(clamp(value, 0, 100))}%</span></label><progress max="100" value="${clamp(value, 0, 100)}"></progress></div>`).join("")}
  </div>`;
}

function renderHvac() {
  els.hvacGrid.innerHTML = hvac.map((ahu) => stat(ahu.name, `${ahu.online ? "ONLINE" : "FAILED"} · ${ahu.supply.toFixed(0)}° supply · ${ahu.ret.toFixed(0)}° return`, ahu.online ? "" : "critical") +
    stat("Fan / Cooling / Static", `${Math.round(ahu.fan)}% · ${Math.round(ahu.cooling)}% · ${ahu.static.toFixed(1)} inWC`, ahu.cooling > 90 ? "warning" : "") +
    stat("Filter", ahu.filter)).join("");
}

function renderWeather() {
  els.weatherPanel.innerHTML = [
    stat("Outside Temp", `${state.weather.temp.toFixed(1)}°F`),
    stat("Rain", `${Math.round(state.weather.rain * 100)}%`, state.weather.rain > 0.72 ? "warning" : ""),
    stat("Wind", `${state.weather.wind.toFixed(1)} mph`, state.weather.wind > 30 ? "warning" : ""),
    stat("Lightning Distance", `${state.weather.lightning.toFixed(1)} miles`, state.weather.lightning < 8 ? "critical" : "")
  ].join("");
}

function renderConcessions() {
  els.concessionPanel.innerHTML = [
    stat("Open Stands", concessions.openStands),
    stat("Staff", concessions.staff),
    stat("Customers Waiting", fmtNumber(concessions.waiting), concessions.waiting > 95 ? "warning" : ""),
    stat("Average Service", `${concessions.avgService}s`),
    stat("POS Status", concessions.pos, concessions.pos === "ONLINE" ? "" : "critical"),
    ...Object.entries(concessions.inventory).map(([item, value]) => stat(item, fmtNumber(value), value < 260 ? "warning" : ""))
  ].join("");
}

function renderDispatch() {
  els.dispatchFeed.innerHTML = dispatch.map((item) => `<li><time>${item.time}</time> · <strong>${item.from}</strong> → CONTROL: ${item.message}</li>`).join("");
}

function renderIncidents() {
  const previousScroll = els.incidentPanel.querySelector(".incident-list")?.scrollTop || 0;
  const open = incidents.filter((incident) => incident.status !== "RESOLVED");
  const history = incidents.filter((incident) => incident.status === "RESOLVED").slice(0, 6);
  els.incidentPanel.innerHTML = `<div class="incident-list">${open.map(renderIncidentCard).join("") || "<div class=\"stat-card\"><strong>No open incidents</strong><span class=\"microcopy\">Something will break soon enough.</span></div>"}</div>
    <div class="subgrid">
      ${stat("Incident History", `${incidents.length} total`)}
      ${stat("Critical Count", state.criticalCount)}
      ${stat("Open Critical", open.filter((item) => item.severity === "CRITICAL").length)}
      <div class="stat-card"><span class="eyebrow">Resolved</span><strong>${history.length}</strong><span class="microcopy">${history.map((item) => item.id).join(", ") || "None"}</span></div>
    </div>`;
  const nextScroller = els.incidentPanel.querySelector(".incident-list");
  if (nextScroller) nextScroller.scrollTop = previousScroll;
}

function renderIncidentCard(incident) {
  const order = state.workOrders.find((item) => item.incidentId === incident.id && item.status !== "DONE");
  return `<article class="incident-card">
    <div class="title-row"><strong>${incident.id} · ${incident.title}</strong><span class="pill ${incident.severity === "CRITICAL" ? "critical" : incident.severity === "WARNING" ? "warning" : ""}">${incident.severity}</span></div>
    <span class="microcopy">${incident.category} · ${incident.source} · ${incident.status} · assigned ${incident.assigned}</span>
    <p class="incident-detail">${incident.detail}</p>
    ${incident.steps?.length ? `<div class="step-strip">${incident.steps.map((step, index) => `<span class="${order && order.progress >= index / incident.steps.length * 100 ? "done" : ""}">${step}</span>`).join("")}</div>` : ""}
    ${order ? `<div class="task-line"><label><span>${order.crew} response</span><span>${Math.round(order.progress)}%</span></label><progress max="100" value="${order.progress}"></progress><span class="microcopy">${workOrderAction(order)} · ${order.status}</span></div>` : ""}
    <div class="runbook-grid">
      <div><b>Why</b><span>${incident.why}</span></div>
      <div><b>Impact</b><span>${incident.impact}</span></div>
      <div><b>Fix</b><span>${incident.fix}</span></div>
    </div>
    ${incident.cascade?.length ? `<span class="microcopy">Cascade: ${incident.cascade.join(" → ")}</span>` : ""}
    <div class="incident-actions">
      <button type="button" data-incident="${incident.id}" data-status="ACKNOWLEDGED">Acknowledge</button>
      <button type="button" data-incident="${incident.id}" data-status="ASSIGNED">Assign Staff</button>
      <button type="button" data-incident="${incident.id}" data-status="MITIGATING">Mitigate</button>
      <button type="button" data-incident="${incident.id}" data-status="RESOLVED">Resolve</button>
    </div>
  </article>`;
}

function renderMoney() {
  const profit = state.money.revenue - state.money.cost;
  els.moneyPanel.innerHTML = [
    stat("Revenue", fmtMoney(state.money.revenue)),
    stat("Tickets", fmtMoney(state.money.tickets)),
    stat("Concessions", fmtMoney(state.money.concessions)),
    stat("Merch + Parking", fmtMoney(state.money.merch + state.money.parking)),
    stat("Operating Cost", fmtMoney(state.money.cost), state.money.cost > state.money.revenue * 0.42 ? "warning" : ""),
    stat("Staffing / Power / Fuel", `${fmtMoney(state.money.staffing)} / ${fmtMoney(state.money.power)} / ${fmtMoney(state.money.fuel)}`),
    stat("Estimated Profit", fmtMoney(profit), profit < 0 ? "critical" : "")
  ].join("");
}

function calculateScore() {
  const openCritical = incidents.filter((i) => i.severity === "CRITICAL" && i.status !== "RESOLVED").length;
  const avgWait = state.totalWaitMinutes / Math.max(1, state.waitSamples);
  const uptime = state.uptimeMinutes / Math.max(1, state.uptimeMinutes + state.downtimeMinutes);
  const delay = Math.max(0, currentDelayMinutes());
  const profit = state.money.revenue - state.money.cost;
  const guest = clamp(100 - avgWait * 2.1 - concessions.waiting * 0.08 - Math.max(0, averageRoomTemp() - 74) * 4, 0, 100);
  const safety = clamp(100 - openCritical * 18 - incidents.filter((i) => i.category === "Crowd" || i.category === "Security" || i.category === "Medical").length * 3, 0, 100);
  const production = clamp(100 * uptime - incidents.filter((i) => i.category === "Production" || i.category === "Network").length * 4, 0, 100);
  const schedule = clamp(100 - delay * 2.5, 0, 100);
  const finance = clamp(55 + profit / 9000, 0, 100);
  return { guest, safety, production, schedule, finance, total: Math.round((guest + safety + production + schedule + finance) / 5) };
}

function averageRoomTemp() {
  return rooms.reduce((sum, room) => sum + roomRuntime.get(room.id).temp, 0) / rooms.length;
}

function renderScore() {
  const previousScroll = els.scorePanel.scrollTop || 0;
  const score = calculateScore();
  els.scorePanel.innerHTML = `<div class="score-big">${score.total} / 100</div>` +
    ["guest", "safety", "production", "schedule", "finance"].map((key) => stat(labelForScore(key), `${Math.round(score[key])}`)).join("") +
    (state.reportGenerated ? `<div class="report-box">
      <strong>Fake Post-Event Report</strong>
      <p class="microcopy">${state.criticalCount} critical incidents · ${Math.max(0, currentDelayMinutes())}-minute doors/show delay · ${(state.uptimeMinutes / Math.max(1, state.uptimeMinutes + state.downtimeMinutes) * 100).toFixed(1)}% production uptime · average entry wait ${Math.round(state.totalWaitMinutes / Math.max(1, state.waitSamples))}m · peak attendance ${fmtNumber(state.peakAttendance)}</p>
    </div>` : "");
  els.scorePanel.scrollTop = previousScroll;
}

function labelForScore(key) {
  return {
    guest: "Guest Experience",
    safety: "Safety",
    production: "Production Reliability",
    schedule: "Schedule Performance",
    finance: "Financial Performance"
  }[key];
}

function buildReport() {
  state.reportGenerated = true;
  addDispatch("CONTROL", `EVENT SCORE generated: ${calculateScore().total}/100`);
  renderAll();
}

function wireEvents() {
  document.addEventListener("click", (event) => {
    const speed = event.target.closest("[data-speed]");
  if (speed) {
      const requestedSpeed = Number(speed.dataset.speed);
      if (state.difficulty === "HARD" && requestedSpeed === 0 && ["DOORS", "OPENER", "CHANGEOVER", "HEADLINER", "ENCORE", "EGRESS"].includes(phase())) {
        state.speed = 1;
        addDispatch("CONTROL", "Hard Mode: pause locked during public show phases. Dropped to 1x.");
      } else {
        state.speed = requestedSpeed;
      }
      renderHeader();
      return;
    }
    const admissionsMode = event.target.closest("[data-admissions]");
    if (admissionsMode) {
      state.admissions.mode = admissionsMode.dataset.admissions;
      state.admissions.autoPausedAt = null;
      addDispatch("ADMISSIONS", `Admissions mode set to ${state.admissions.mode}.`);
      renderAll();
      return;
    }
    const scenario = event.target.closest("[data-scenario]");
    if (scenario) {
      applyScenario(scenario.dataset.scenario);
      return;
    }
    const difficulty = event.target.closest("[data-difficulty]");
    if (difficulty) {
      state.difficulty = difficulty.dataset.difficulty;
      addDispatch("CONTROL", `Difficulty set to ${state.difficulty}.`);
      renderAll();
      return;
    }
    const staffAdjust = event.target.closest("[data-staff-adjust]");
    if (staffAdjust) {
      const [team, deltaText] = staffAdjust.dataset.staffAdjust.split(":");
      adjustScheduledStaff(team, Number(deltaText));
      return;
    }
    const phaseNode = event.target.closest("[data-phase]");
    if (phaseNode) {
      const target = Number(phaseNode.dataset.phase);
      if (target !== state.phaseIndex) {
        if (target > state.phaseIndex + 1) {
          addDispatch("CONTROL", "Phase rail only allows the next phase once the current work is complete.");
          renderAll();
          return;
        }
        if (target > state.phaseIndex && !phaseReadyForAutoAdvance()) {
          addDispatch("CONTROL", `${phase()} is locked until current tasks finish.`);
          renderAll();
          return;
        }
        state.phaseIndex = target;
        state.simMinute = Math.max(state.simMinute, effectiveStart(target));
        state.phaseActualStarts[target] ??= state.simMinute;
        addDispatch("CONTROL", `Manual jump to ${phase()}`);
        renderAll();
      }
      return;
    }
    const room = event.target.closest("[data-room]");
    if (room) {
      state.selectedRoomId = room.dataset.room;
      renderVenueMap();
      renderInspector();
      return;
    }
    const prod = event.target.closest("[data-production]");
    if (prod) {
      state.selectedProduction = prod.dataset.production;
      renderProduction();
      return;
    }
    const incidentAction = event.target.closest("[data-incident]");
    if (incidentAction) {
      setIncidentStatus(incidentAction.dataset.incident, incidentAction.dataset.status);
      return;
    }
    const reassign = event.target.closest("[data-reassign]");
    if (reassign) {
      const [from, to] = reassign.dataset.reassign.split(":");
      reassignStaff(from, to);
      return;
    }
    const dispatchCrew = event.target.closest("[data-dispatch]");
    if (dispatchCrew) {
      dispatchCrewTo(dispatchCrew.dataset.dispatch);
      return;
    }
    if (event.target.id === "killLightingNode") {
      state.production.lightingNodeFault = true;
      createIncident("Production", "WARNING", "Lighting node failure - universes 4 and 5 offline", "Stage Right");
      renderAll();
    }
    if (event.target.id === "restoreLightingNode") {
      state.production.lightingNodeFault = false;
      addDispatch("LIGHTING", "Node restored. Universes 4 and 5 back online.");
      renderAll();
    }
    if (event.target.id === "failPlayback") {
      state.production.playbackAFailed = true;
      state.production.videoBackupActive = true;
      createIncident("Production", "WARNING", "Playback A failed - auto switched to B", "FOH");
      renderAll();
    }
    if (event.target.id === "restorePlayback") {
      state.production.playbackAFailed = false;
      state.production.videoBackupActive = false;
      addDispatch("VIDEO", "Playback A restored and synced.");
      renderAll();
    }
  });

  els.advancePhase.addEventListener("click", () => advancePhase(true));
  els.delayDoors.addEventListener("click", () => {
    state.timelineDelay += 5;
    createIncident("Production", "ADVISORY", "Manual timeline hold added five minutes", "Production Office");
    renderAll();
  });
  els.generateReport.addEventListener("click", buildReport);
  els.sendCrewIn.addEventListener("click", () => {
    sendCrewIn();
  });
  els.openDock.addEventListener("click", () => {
    state.dockDoorsOpen = true;
    addDispatch("DOCK", "Dock doors opened. Trucks cleared to back in.");
    renderAll();
  });
  els.callForklift.addEventListener("click", () => {
    state.forkliftsActive = clamp(state.forkliftsActive + 1, 0, 4);
    state.money.cost += 180;
    addDispatch("STAGE", `Forklift ${state.forkliftsActive} assigned to service road.`);
    renderAll();
  });
  els.crewBreak.addEventListener("click", () => {
    state.breaksGiven += 1;
    state.breakActive = true;
    state.breakTimer = 0;
    state.breakStatus = "TO BREAK";
    state.crewFatigue = Math.max(0, state.crewFatigue - 28);
    state.timelineDelay += 3;
    state.money.cost += 900;
    addDispatch("PM", "Crew break called. Fatigue reduced, but schedule slipped three minutes.");
    renderAll();
  });
  els.addSecurityLane.addEventListener("click", () => {
    state.securityLanes += 1;
    state.money.cost += 450;
    addDispatch("SECURITY", `Opened lane ${state.securityLanes}. Staffing cost increased.`);
    renderAll();
  });
  els.admissionsMeter.addEventListener("change", () => {
    state.admissions.meteredMax = clamp(Number(els.admissionsMeter.value) || 120, 20, 320);
    addDispatch("ADMISSIONS", `Metered scan cap set to ${Math.round(state.admissions.meteredMax)} guests/min.`);
    renderAll();
  });
  els.capacityOverride.addEventListener("click", () => {
    state.admissions.overrideCapacity = !state.admissions.overrideCapacity;
    if (state.admissions.overrideCapacity && state.admissions.mode === "PAUSED") state.admissions.mode = "METERED";
    addDispatch("ADMISSIONS", state.admissions.overrideCapacity ? "Capacity override armed by operator." : "Capacity override disabled; hard interlock armed.");
    renderAll();
  });
  els.calloutStaff.addEventListener("click", () => {
    const keys = Object.keys(staff);
    const key = keys[Math.floor(Math.random() * keys.length)];
    staff[key].checkedIn = Math.max(0, staff[key].checkedIn - 1);
    staff[key].assigned = Math.min(staff[key].assigned, staff[key].checkedIn);
    createIncident("Staffing", "ADVISORY", `${key} callout received`, "Security Office");
    renderAll();
  });
  els.shedLobbyLights.addEventListener("click", () => {
    state.lobbyDecorativeLights = false;
    addDispatch("ELECTRICAL", "Lobby decorative lighting disabled. Freed 14 kW.");
    renderAll();
  });
  els.addLightingLoad.addEventListener("click", () => {
    state.extraLightingLoad += 18;
    addDispatch("LIGHTING", "Additional lighting load patched into Production A.");
    renderAll();
  });
  els.forceUtilityFail.addEventListener("click", () => {
    state.utilityAFailed = true;
    createIncident("Electrical", "CRITICAL", "Utility A failure - ATS sequence started", "Main Electrical", [
      "Generator start requested",
      "UPS carrying critical systems during transfer"
    ]);
    renderAll();
  });
  els.startGenerators.addEventListener("click", () => {
    [backup.gen1, backup.gen2].forEach((gen) => {
      if (gen.state === "OFF") gen.state = "STARTING";
    });
    addDispatch("ELECTRICAL", "Manual generator start requested.");
    renderAll();
  });
  els.failCoreA.addEventListener("click", () => {
    state.coreAFailed = true;
    state.failoverTimer = 0;
    renderAll();
  });
  els.failAhu.addEventListener("click", () => {
    const online = hvac.filter((ahu) => ahu.online);
    const target = online[Math.floor(Math.random() * online.length)] || hvac[0];
    target.online = false;
    renderAll();
  });
  els.stormButton.addEventListener("click", () => {
    state.weather.rain = 0.86;
    state.weather.wind = 34;
    state.weather.lightning = 5.8;
    createIncident("Weather", "WARNING", "Severe weather cell over venue", "Truck Lot");
    renderAll();
  });
  els.openConcession.addEventListener("click", () => {
    concessions.openStands += 1;
    concessions.staff += 4;
    state.money.cost += 520;
    addDispatch("CONCESSIONS", `Opened stand ${concessions.openStands}. Added four staff.`);
    renderAll();
  });
  els.spawnIncident.addEventListener("click", () => {
    maybeRandomIncident();
    renderAll();
  });
}

function sendCrewIn() {
  if (!state.crewDeployed) {
    state.crewDeployed = true;
    state.dockDoorsOpen = true;
    state.forkliftsActive = Math.max(1, state.forkliftsActive);
    state.staffIntake = 0;
    state.speed = state.speed === 0 ? 20 : state.speed;
    if (state.phaseIndex === 0) {
      state.phaseIndex = 1;
      state.simMinute = Math.max(state.simMinute, effectiveStart(1));
      state.phaseActualStarts[1] = state.simMinute;
    }
    addDispatch("CONTROL", "Crew dispatched through backstage hall. Load-in phase started.");
    addDispatch("DOCK", "Dock door 2 open. First truck moving to bay.");
    addDispatch("STAGE", "Stagehands walking service route to stage left and freight elevator.");
  } else {
    addDispatch("CONTROL", "Crew is already on site and moving.");
  }
  renderAll();
}

function reassignStaff(from, to) {
  if (!staff[from] || !staff[to] || staff[from].assigned <= 0) return;
  staff[from].assigned -= 1;
  staff[to].assigned = Math.min(staff[to].checkedIn, staff[to].assigned + 1);
  addDispatch("CONTROL", `Reassigned one ${from} employee to ${to}.`);
  renderAll();
}

function dispatchCrewTo(team) {
  if (staff[team] && staff[team].assigned < staff[team].checkedIn) {
    staff[team].assigned += 1;
  }
  addDispatch(team.toUpperCase(), `Crew dispatched. Available coverage adjusted.`);
  renderAll();
}

function animationLoop(now) {
  const realDtSeconds = Math.min(1.5, (now - lastFrame) / 1000);
  lastFrame = now;
  const simDtMinutes = state.speed === 0 ? 0 : realDtSeconds * state.speed / 60;
  if (simDtMinutes > 0) updateSimulation(simDtMinutes);
  renderAccumulator += realDtSeconds;
  uiRenderAccumulator += realDtSeconds;
  if (renderAccumulator > 0.08) {
    renderAccumulator = 0;
    renderVenueMap();
  }
  if (uiRenderAccumulator > 0.35) {
    uiRenderAccumulator = 0;
    renderAll();
  }
  requestAnimationFrame(animationLoop);
}

function seed() {
  addDispatch("CONTROL", "Venue simulator booted in DARK. Press Send Crew In to start load-in.");
  addDispatch("IT", "CORE-SW-A primary, CORE-SW-B standby. ISP links nominal.");
  addDispatch("PRODUCTION", "Crew call is pending. Trucks are holding outside the dock.");
  createIncident("Staffing", "INFO", "Security missing 5 scheduled staff at check-in", "Security Office");
  renderAll();
  wireEvents();
  requestAnimationFrame(animationLoop);
}

seed();
