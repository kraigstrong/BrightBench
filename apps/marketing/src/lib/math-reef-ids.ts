// Math Reef's world and level IDs, shared by the analytics endpoint (server) and the stats
// dashboard (browser). Plain data only, so the browser bundle never pulls in server code.

export const worldIds = ['addition', 'subtraction', 'multiplication', 'division', 'exponents'] as const;

/**
 * Every level ID in `MathReef/Curriculum.swift`. The app never renames these, but when Math Reef
 * adds a level its ID must be added here before that app version ships, or its events are rejected.
 */
export const levelIds = [
  'add.plus12', 'add.make10', 'add.doubles', 'add.within10', 'add.nearDoubles', 'add.cross10',
  'add.ones', 'add.tens', 'add.2digit', 'add.carryOnes', 'add.carry', 'add.review20', 'add.review',
  'sub.minus12', 'sub.from10', 'sub.doubles', 'sub.within10', 'sub.back10', 'sub.within20',
  'sub.ones', 'sub.tens', 'sub.2digit', 'sub.borrowOnes', 'sub.borrow', 'sub.mixed20', 'sub.mixed',
  'mul.x2', 'mul.x10', 'mul.x5', 'mul.x01', 'mul.x3', 'mul.x4', 'mul.same', 'mul.x9', 'mul.x6',
  'mul.x8', 'mul.x7', 'mul.x1112', 'mul.tens', 'mul.2digit', 'mul.carry', 'mul.easy', 'mul.tables',
  'mul.review',
  'div.x2', 'div.x10', 'div.x5', 'div.x3', 'div.x4', 'div.same', 'div.x9', 'div.x6', 'div.x8',
  'div.x7', 'div.x1112', 'div.tens', 'div.2digit', 'div.regroup', 'div.easy', 'div.tables',
  'div.mixed',
  'exp.1', 'exp.2', 'exp.3',
] as const;
