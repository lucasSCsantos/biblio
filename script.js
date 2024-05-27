const global = {
  chances: 6,
  boxes: 6,
};

const bible = {
  gn: [
    { chapter: 1, versicles: 31 },
    { chapter: 2, versicles: 25 },
    { chapter: 3, versicles: 24 },
    { chapter: 4, versicles: 26 },
    { chapter: 5, versicles: 32 },
    { chapter: 6, versicles: 22 },
    { chapter: 7, versicles: 24 },
    { chapter: 8, versicles: 22 },
    { chapter: 9, versicles: 29 },
    { chapter: 10, versicles: 32 },
    { chapter: 11, versicles: 32 },
    { chapter: 12, versicles: 20 },
    { chapter: 13, versicles: 18 },
    { chapter: 14, versicles: 24 },
    { chapter: 15, versicles: 21 },
    { chapter: 16, versicles: 16 },
    { chapter: 17, versicles: 27 },
    { chapter: 18, versicles: 33 },
    { chapter: 19, versicles: 38 },
    { chapter: 20, versicles: 18 },
    { chapter: 21, versicles: 34 },
    { chapter: 22, versicles: 24 },
    { chapter: 23, versicles: 20 },
    { chapter: 24, versicles: 67 },
    { chapter: 25, versicles: 34 },
    { chapter: 26, versicles: 35 },
    { chapter: 27, versicles: 46 },
    { chapter: 28, versicles: 22 },
    { chapter: 29, versicles: 35 },
    { chapter: 30, versicles: 43 },
    { chapter: 31, versicles: 55 },
    { chapter: 32, versicles: 32 },
    { chapter: 33, versicles: 20 },
    { chapter: 34, versicles: 31 },
    { chapter: 35, versicles: 29 },
    { chapter: 36, versicles: 43 },
    { chapter: 37, versicles: 36 },
    { chapter: 38, versicles: 30 },
    { chapter: 39, versicles: 23 },
    { chapter: 40, versicles: 23 },
    { chapter: 41, versicles: 57 },
    { chapter: 42, versicles: 38 },
    { chapter: 43, versicles: 34 },
    { chapter: 44, versicles: 34 },
    { chapter: 45, versicles: 28 },
    { chapter: 46, versicles: 34 },
    { chapter: 47, versicles: 31 },
    { chapter: 48, versicles: 22 },
    { chapter: 49, versicles: 33 },
    { chapter: 50, versicles: 26 },
  ],
  ex: [
    { chapter: 1, versicles: 22 },
    { chapter: 2, versicles: 25 },
    { chapter: 3, versicles: 22 },
    { chapter: 4, versicles: 31 },
    { chapter: 5, versicles: 23 },
    { chapter: 6, versicles: 30 },
    { chapter: 7, versicles: 25 },
    { chapter: 8, versicles: 32 },
    { chapter: 9, versicles: 35 },
    { chapter: 10, versicles: 29 },
    { chapter: 11, versicles: 10 },
    { chapter: 12, versicles: 51 },
    { chapter: 13, versicles: 22 },
    { chapter: 14, versicles: 31 },
    { chapter: 15, versicles: 27 },
    { chapter: 16, versicles: 36 },
    { chapter: 17, versicles: 16 },
    { chapter: 18, versicles: 27 },
    { chapter: 19, versicles: 25 },
    { chapter: 20, versicles: 26 },
    { chapter: 21, versicles: 36 },
    { chapter: 22, versicles: 31 },
    { chapter: 23, versicles: 33 },
    { chapter: 24, versicles: 18 },
    { chapter: 25, versicles: 40 },
    { chapter: 26, versicles: 37 },
    { chapter: 27, versicles: 21 },
    { chapter: 28, versicles: 43 },
    { chapter: 29, versicles: 46 },
    { chapter: 30, versicles: 38 },
    { chapter: 31, versicles: 18 },
    { chapter: 32, versicles: 35 },
    { chapter: 33, versicles: 23 },
    { chapter: 34, versicles: 35 },
    { chapter: 35, versicles: 35 },
    { chapter: 36, versicles: 38 },
    { chapter: 37, versicles: 29 },
    { chapter: 38, versicles: 31 },
    { chapter: 39, versicles: 43 },
    { chapter: 40, versicles: 38 },
  ],
  lv: [
    { chapter: 1, versicles: 17 },
    { chapter: 2, versicles: 16 },
    { chapter: 3, versicles: 17 },
    { chapter: 4, versicles: 35 },
    { chapter: 5, versicles: 19 },
    { chapter: 6, versicles: 30 },
    { chapter: 7, versicles: 38 },
    { chapter: 8, versicles: 36 },
    { chapter: 9, versicles: 24 },
    { chapter: 10, versicles: 20 },
    { chapter: 11, versicles: 47 },
    { chapter: 12, versicles: 8 },
    { chapter: 13, versicles: 59 },
    { chapter: 14, versicles: 57 },
    { chapter: 15, versicles: 33 },
    { chapter: 16, versicles: 34 },
    { chapter: 17, versicles: 16 },
    { chapter: 18, versicles: 30 },
    { chapter: 19, versicles: 37 },
    { chapter: 20, versicles: 27 },
    { chapter: 21, versicles: 24 },
    { chapter: 22, versicles: 33 },
    { chapter: 23, versicles: 44 },
    { chapter: 24, versicles: 23 },
    { chapter: 25, versicles: 55 },
    { chapter: 26, versicles: 46 },
    { chapter: 27, versicles: 34 },
  ],
  nm: [
    { chapter: 1, versicles: 54 },
    { chapter: 2, versicles: 34 },
    { chapter: 3, versicles: 51 },
    { chapter: 4, versicles: 49 },
    { chapter: 5, versicles: 31 },
    { chapter: 6, versicles: 27 },
    { chapter: 7, versicles: 89 },
    { chapter: 8, versicles: 26 },
    { chapter: 9, versicles: 23 },
    { chapter: 10, versicles: 36 },
    { chapter: 11, versicles: 35 },
    { chapter: 12, versicles: 16 },
    { chapter: 13, versicles: 33 },
    { chapter: 14, versicles: 45 },
    { chapter: 15, versicles: 41 },
    { chapter: 16, versicles: 50 },
    { chapter: 17, versicles: 13 },
    { chapter: 18, versicles: 32 },
    { chapter: 19, versicles: 22 },
    { chapter: 20, versicles: 29 },
    { chapter: 21, versicles: 35 },
    { chapter: 22, versicles: 41 },
    { chapter: 23, versicles: 30 },
    { chapter: 24, versicles: 25 },
    { chapter: 25, versicles: 18 },
    { chapter: 26, versicles: 65 },
    { chapter: 27, versicles: 23 },
    { chapter: 28, versicles: 31 },
    { chapter: 29, versicles: 40 },
    { chapter: 30, versicles: 16 },
    { chapter: 31, versicles: 54 },
    { chapter: 32, versicles: 42 },
    { chapter: 33, versicles: 56 },
    { chapter: 34, versicles: 29 },
    { chapter: 35, versicles: 34 },
    { chapter: 36, versicles: 13 },
  ],
  dt: [
    { chapter: 1, versicles: 46 },
    { chapter: 2, versicles: 37 },
    { chapter: 3, versicles: 29 },
    { chapter: 4, versicles: 49 },
    { chapter: 5, versicles: 33 },
    { chapter: 6, versicles: 25 },
    { chapter: 7, versicles: 26 },
    { chapter: 8, versicles: 20 },
    { chapter: 9, versicles: 29 },
    { chapter: 10, versicles: 22 },
    { chapter: 11, versicles: 32 },
    { chapter: 12, versicles: 32 },
    { chapter: 13, versicles: 18 },
    { chapter: 14, versicles: 29 },
    { chapter: 15, versicles: 23 },
    { chapter: 16, versicles: 22 },
    { chapter: 17, versicles: 20 },
    { chapter: 18, versicles: 22 },
    { chapter: 19, versicles: 21 },
    { chapter: 20, versicles: 20 },
    { chapter: 21, versicles: 23 },
    { chapter: 22, versicles: 30 },
    { chapter: 23, versicles: 25 },
    { chapter: 24, versicles: 22 },
    { chapter: 25, versicles: 19 },
    { chapter: 26, versicles: 19 },
    { chapter: 27, versicles: 26 },
    { chapter: 28, versicles: 68 },
    { chapter: 29, versicles: 29 },
    { chapter: 30, versicles: 20 },
    { chapter: 31, versicles: 30 },
    { chapter: 32, versicles: 52 },
    { chapter: 33, versicles: 29 },
    { chapter: 34, versicles: 12 },
  ],
  js: [
    { chapter: 1, versicles: 18 },
    { chapter: 2, versicles: 24 },
    { chapter: 3, versicles: 17 },
    { chapter: 4, versicles: 24 },
    { chapter: 5, versicles: 15 },
    { chapter: 6, versicles: 27 },
    { chapter: 7, versicles: 26 },
    { chapter: 8, versicles: 35 },
    { chapter: 9, versicles: 27 },
    { chapter: 10, versicles: 43 },
    { chapter: 11, versicles: 23 },
    { chapter: 12, versicles: 24 },
    { chapter: 13, versicles: 33 },
    { chapter: 14, versicles: 15 },
    { chapter: 15, versicles: 63 },
    { chapter: 16, versicles: 10 },
    { chapter: 17, versicles: 18 },
    { chapter: 18, versicles: 28 },
    { chapter: 19, versicles: 51 },
    { chapter: 20, versicles: 9 },
    { chapter: 21, versicles: 45 },
    { chapter: 22, versicles: 34 },
    { chapter: 23, versicles: 16 },
    { chapter: 24, versicles: 33 },
  ],
  jz: [
    { chapter: 1, versicles: 36 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 31 },
    { chapter: 4, versicles: 24 },
    { chapter: 5, versicles: 31 },
    { chapter: 6, versicles: 40 },
    { chapter: 7, versicles: 25 },
    { chapter: 8, versicles: 35 },
    { chapter: 9, versicles: 57 },
    { chapter: 10, versicles: 18 },
    { chapter: 11, versicles: 40 },
    { chapter: 12, versicles: 15 },
    { chapter: 13, versicles: 25 },
    { chapter: 14, versicles: 20 },
    { chapter: 15, versicles: 20 },
    { chapter: 16, versicles: 31 },
    { chapter: 17, versicles: 13 },
    { chapter: 18, versicles: 31 },
    { chapter: 19, versicles: 30 },
    { chapter: 20, versicles: 48 },
    { chapter: 21, versicles: 25 },
  ],
  rt: [
    { chapter: 1, versicles: 22 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 18 },
    { chapter: 4, versicles: 22 },
  ],
  // "1sm": [
  //   { chapter: 1, versicles: 28 },
  //   { chapter: 2, versicles: 36 },
  //   { chapter: 3, versicles: 21 },
  //   { chapter: 4, versicles: 22 },
  //   { chapter: 5, versicles: 12 },
  //   { chapter: 6, versicles: 21 },
  //   { chapter: 7, versicles: 17 },
  //   { chapter: 8, versicles: 22 },
  //   { chapter: 9, versicles: 27 },
  //   { chapter: 10, versicles: 27 },
  //   { chapter: 11, versicles: 15 },
  //   { chapter: 12, versicles: 25 },
  //   { chapter: 13, versicles: 23 },
  //   { chapter: 14, versicles: 52 },
  //   { chapter: 15, versicles: 35 },
  //   { chapter: 16, versicles: 23 },
  //   { chapter: 17, versicles: 58 },
  //   { chapter: 18, versicles: 30 },
  //   { chapter: 19, versicles: 24 },
  //   { chapter: 20, versicles: 43 },
  //   { chapter: 21, versicles: 15 },
  //   { chapter: 22, versicles: 23 },
  //   { chapter: 23, versicles: 29 },
  //   { chapter: 24, versicles: 22 },
  //   { chapter: 25, versicles: 44 },
  //   { chapter: 26, versicles: 25 },
  //   { chapter: 27, versicles: 12 },
  //   { chapter: 28, versicles: 25 },
  //   { chapter: 29, versicles: 11 },
  //   { chapter: 30, versicles: 31 },
  //   { chapter: 31, versicles: 13 },
  // ],
  // "2sm": [
  //   { chapter: 1, versicles: 27 },
  //   { chapter: 2, versicles: 32 },
  //   { chapter: 3, versicles: 39 },
  //   { chapter: 4, versicles: 12 },
  //   { chapter: 5, versicles: 25 },
  //   { chapter: 6, versicles: 23 },
  //   { chapter: 7, versicles: 29 },
  //   { chapter: 8, versicles: 18 },
  //   { chapter: 9, versicles: 13 },
  //   { chapter: 10, versicles: 19 },
  //   { chapter: 11, versicles: 27 },
  //   { chapter: 12, versicles: 31 },
  //   { chapter: 13, versicles: 39 },
  //   { chapter: 14, versicles: 33 },
  //   { chapter: 15, versicles: 37 },
  //   { chapter: 16, versicles: 23 },
  //   { chapter: 17, versicles: 29 },
  //   { chapter: 18, versicles: 33 },
  //   { chapter: 19, versicles: 43 },
  //   { chapter: 20, versicles: 26 },
  //   { chapter: 21, versicles: 22 },
  //   { chapter: 22, versicles: 51 },
  //   { chapter: 23, versicles: 39 },
  //   { chapter: 24, versicles: 25 },
  // ],
  // "1rs": [
  //   { chapter: 1, versicles: 53 },
  //   { chapter: 2, versicles: 46 },
  //   { chapter: 3, versicles: 28 },
  //   { chapter: 4, versicles: 34 },
  //   { chapter: 5, versicles: 18 },
  //   { chapter: 6, versicles: 38 },
  //   { chapter: 7, versicles: 51 },
  //   { chapter: 8, versicles: 66 },
  //   { chapter: 9, versicles: 28 },
  //   { chapter: 10, versicles: 29 },
  //   { chapter: 11, versicles: 43 },
  //   { chapter: 12, versicles: 33 },
  //   { chapter: 13, versicles: 34 },
  //   { chapter: 14, versicles: 31 },
  //   { chapter: 15, versicles: 34 },
  //   { chapter: 16, versicles: 34 },
  //   { chapter: 17, versicles: 24 },
  //   { chapter: 18, versicles: 46 },
  //   { chapter: 19, versicles: 21 },
  //   { chapter: 20, versicles: 43 },
  //   { chapter: 21, versicles: 29 },
  //   { chapter: 22, versicles: 53 },
  // ],
  // "2rs": [
  //   { chapter: 1, versicles: 18 },
  //   { chapter: 2, versicles: 25 },
  //   { chapter: 3, versicles: 27 },
  //   { chapter: 4, versicles: 44 },
  //   { chapter: 5, versicles: 27 },
  //   { chapter: 6, versicles: 33 },
  //   { chapter: 7, versicles: 20 },
  //   { chapter: 8, versicles: 29 },
  //   { chapter: 9, versicles: 37 },
  //   { chapter: 10, versicles: 36 },
  //   { chapter: 11, versicles: 21 },
  //   { chapter: 12, versicles: 21 },
  //   { chapter: 13, versicles: 25 },
  //   { chapter: 14, versicles: 29 },
  //   { chapter: 15, versicles: 38 },
  //   { chapter: 16, versicles: 20 },
  //   { chapter: 17, versicles: 41 },
  //   { chapter: 18, versicles: 37 },
  //   { chapter: 19, versicles: 37 },
  //   { chapter: 20, versicles: 21 },
  //   { chapter: 21, versicles: 26 },
  //   { chapter: 22, versicles: 20 },
  //   { chapter: 23, versicles: 37 },
  //   { chapter: 24, versicles: 20 },
  //   { chapter: 25, versicles: 30 },
  // ],
  // "1cr": [
  //   { chapter: 1, versicles: 54 },
  //   { chapter: 2, versicles: 55 },
  //   { chapter: 3, versicles: 24 },
  //   { chapter: 4, versicles: 43 },
  //   { chapter: 5, versicles: 26 },
  //   { chapter: 6, versicles: 81 },
  //   { chapter: 7, versicles: 40 },
  //   { chapter: 8, versicles: 40 },
  //   { chapter: 9, versicles: 44 },
  //   { chapter: 10, versicles: 14 },
  //   { chapter: 11, versicles: 47 },
  //   { chapter: 12, versicles: 40 },
  //   { chapter: 13, versicles: 14 },
  //   { chapter: 14, versicles: 17 },
  //   { chapter: 15, versicles: 29 },
  //   { chapter: 16, versicles: 43 },
  //   { chapter: 17, versicles: 27 },
  //   { chapter: 18, versicles: 17 },
  //   { chapter: 19, versicles: 19 },
  //   { chapter: 20, versicles: 8 },
  //   { chapter: 21, versicles: 30 },
  //   { chapter: 22, versicles: 19 },
  //   { chapter: 23, versicles: 32 },
  //   { chapter: 24, versicles: 31 },
  //   { chapter: 25, versicles: 31 },
  //   { chapter: 26, versicles: 32 },
  //   { chapter: 27, versicles: 34 },
  //   { chapter: 28, versicles: 21 },
  //   { chapter: 29, versicles: 30 },
  // ],
  // "2cr": [
  //   { chapter: 1, versicles: 17 },
  //   { chapter: 2, versicles: 18 },
  //   { chapter: 3, versicles: 17 },
  //   { chapter: 4, versicles: 22 },
  //   { chapter: 5, versicles: 14 },
  //   { chapter: 6, versicles: 42 },
  //   { chapter: 7, versicles: 22 },
  //   { chapter: 8, versicles: 18 },
  //   { chapter: 9, versicles: 31 },
  //   { chapter: 10, versicles: 19 },
  //   { chapter: 11, versicles: 23 },
  //   { chapter: 12, versicles: 16 },
  //   { chapter: 13, versicles: 22 },
  //   { chapter: 14, versicles: 15 },
  //   { chapter: 15, versicles: 19 },
  //   { chapter: 16, versicles: 14 },
  //   { chapter: 17, versicles: 19 },
  //   { chapter: 18, versicles: 34 },
  //   { chapter: 19, versicles: 11 },
  //   { chapter: 20, versicles: 37 },
  //   { chapter: 21, versicles: 20 },
  //   { chapter: 22, versicles: 12 },
  //   { chapter: 23, versicles: 21 },
  //   { chapter: 24, versicles: 27 },
  //   { chapter: 25, versicles: 28 },
  //   { chapter: 26, versicles: 23 },
  //   { chapter: 27, versicles: 9 },
  //   { chapter: 28, versicles: 27 },
  //   { chapter: 29, versicles: 36 },
  //   { chapter: 30, versicles: 27 },
  //   { chapter: 31, versicles: 21 },
  //   { chapter: 32, versicles: 33 },
  //   { chapter: 33, versicles: 25 },
  //   { chapter: 34, versicles: 33 },
  //   { chapter: 35, versicles: 27 },
  //   { chapter: 36, versicles: 23 },
  // ],
  ed: [
    { chapter: 1, versicles: 11 },
    { chapter: 2, versicles: 70 },
    { chapter: 3, versicles: 13 },
    { chapter: 4, versicles: 24 },
    { chapter: 5, versicles: 17 },
    { chapter: 6, versicles: 22 },
    { chapter: 7, versicles: 28 },
    { chapter: 8, versicles: 36 },
    { chapter: 9, versicles: 15 },
    { chapter: 10, versicles: 44 },
  ],
  ne: [
    { chapter: 1, versicles: 11 },
    { chapter: 2, versicles: 20 },
    { chapter: 3, versicles: 32 },
    { chapter: 4, versicles: 23 },
    { chapter: 5, versicles: 19 },
    { chapter: 6, versicles: 19 },
    { chapter: 7, versicles: 73 },
    { chapter: 8, versicles: 18 },
    { chapter: 9, versicles: 38 },
    { chapter: 10, versicles: 39 },
    { chapter: 11, versicles: 36 },
    { chapter: 12, versicles: 47 },
    { chapter: 13, versicles: 31 },
  ],
  et: [
    { chapter: 1, versicles: 22 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 15 },
    { chapter: 4, versicles: 17 },
    { chapter: 5, versicles: 14 },
    { chapter: 6, versicles: 14 },
    { chapter: 7, versicles: 10 },
    { chapter: 8, versicles: 17 },
    { chapter: 9, versicles: 32 },
    { chapter: 10, versicles: 3 },
  ],
  // "jó": [
  //   { chapter: 1, versicles: 22 },
  //   { chapter: 2, versicles: 13 },
  //   { chapter: 3, versicles: 26 },
  //   { chapter: 4, versicles: 21 },
  //   { chapter: 5, versicles: 27 },
  //   { chapter: 6, versicles: 30 },
  //   { chapter: 7, versicles: 21 },
  //   { chapter: 8, versicles: 22 },
  //   { chapter: 9, versicles: 35 },
  //   { chapter: 10, versicles: 22 },
  //   { chapter: 11, versicles: 20 },
  //   { chapter: 12, versicles: 25 },
  //   { chapter: 13, versicles: 28 },
  //   { chapter: 14, versicles: 22 },
  //   { chapter: 15, versicles: 35 },
  //   { chapter: 16, versicles: 22 },
  //   { chapter: 17, versicles: 16 },
  //   { chapter: 18, versicles: 21 },
  //   { chapter: 19, versicles: 29 },
  //   { chapter: 20, versicles: 29 },
  //   { chapter: 21, versicles: 34 },
  //   { chapter: 22, versicles: 30 },
  //   { chapter: 23, versicles: 17 },
  //   { chapter: 24, versicles: 25 },
  //   { chapter: 25, versicles: 6 },
  //   { chapter: 26, versicles: 14 },
  //   { chapter: 27, versicles: 23 },
  //   { chapter: 28, versicles: 28 },
  //   { chapter: 29, versicles: 25 },
  //   { chapter: 30, versicles: 31 },
  //   { chapter: 31, versicles: 40 },
  //   { chapter: 32, versicles: 22 },
  //   { chapter: 33, versicles: 33 },
  //   { chapter: 34, versicles: 37 },
  //   { chapter: 35, versicles: 16 },
  //   { chapter: 36, versicles: 33 },
  //   { chapter: 37, versicles: 24 },
  //   { chapter: 38, versicles: 41 },
  //   { chapter: 39, versicles: 30 },
  //   { chapter: 40, versicles: 24 },
  //   { chapter: 41, versicles: 34 },
  //   { chapter: 42, versicles: 17 },
  // ],
  sl: [
    { chapter: 1, versicles: 6 },
    { chapter: 2, versicles: 12 },
    { chapter: 3, versicles: 8 },
    { chapter: 4, versicles: 8 },
    { chapter: 5, versicles: 12 },
    { chapter: 6, versicles: 10 },
    { chapter: 7, versicles: 17 },
    { chapter: 8, versicles: 9 },
    { chapter: 9, versicles: 20 },
    { chapter: 10, versicles: 18 },
    { chapter: 11, versicles: 7 },
    { chapter: 12, versicles: 8 },
    { chapter: 13, versicles: 6 },
    { chapter: 14, versicles: 7 },
    { chapter: 15, versicles: 5 },
    { chapter: 16, versicles: 11 },
    { chapter: 17, versicles: 15 },
    { chapter: 18, versicles: 50 },
    { chapter: 19, versicles: 14 },
    { chapter: 20, versicles: 9 },
    { chapter: 21, versicles: 13 },
    { chapter: 22, versicles: 31 },
    { chapter: 23, versicles: 6 },
    { chapter: 24, versicles: 10 },
    { chapter: 25, versicles: 22 },
    { chapter: 26, versicles: 12 },
    { chapter: 27, versicles: 14 },
    { chapter: 28, versicles: 9 },
    { chapter: 29, versicles: 11 },
    { chapter: 30, versicles: 12 },
    { chapter: 31, versicles: 24 },
    { chapter: 32, versicles: 11 },
    { chapter: 33, versicles: 22 },
    { chapter: 34, versicles: 22 },
    { chapter: 35, versicles: 28 },
    { chapter: 36, versicles: 12 },
    { chapter: 37, versicles: 40 },
    { chapter: 38, versicles: 22 },
    { chapter: 39, versicles: 13 },
    { chapter: 40, versicles: 17 },
    { chapter: 41, versicles: 13 },
    { chapter: 42, versicles: 11 },
    { chapter: 43, versicles: 5 },
    { chapter: 44, versicles: 26 },
    { chapter: 45, versicles: 17 },
    { chapter: 46, versicles: 11 },
    { chapter: 47, versicles: 9 },
    { chapter: 48, versicles: 14 },
    { chapter: 49, versicles: 20 },
    { chapter: 50, versicles: 23 },
    { chapter: 51, versicles: 19 },
    { chapter: 52, versicles: 9 },
    { chapter: 53, versicles: 6 },
    { chapter: 54, versicles: 7 },
    { chapter: 55, versicles: 23 },
    { chapter: 56, versicles: 13 },
    { chapter: 57, versicles: 11 },
    { chapter: 58, versicles: 11 },
    { chapter: 59, versicles: 17 },
    { chapter: 60, versicles: 12 },
    { chapter: 61, versicles: 8 },
    { chapter: 62, versicles: 12 },
    { chapter: 63, versicles: 11 },
    { chapter: 64, versicles: 10 },
    { chapter: 65, versicles: 13 },
    { chapter: 66, versicles: 20 },
    { chapter: 67, versicles: 7 },
    { chapter: 68, versicles: 35 },
    { chapter: 69, versicles: 36 },
    { chapter: 70, versicles: 5 },
    { chapter: 71, versicles: 24 },
    { chapter: 72, versicles: 20 },
    { chapter: 73, versicles: 28 },
    { chapter: 74, versicles: 23 },
    { chapter: 75, versicles: 10 },
    { chapter: 76, versicles: 12 },
    { chapter: 77, versicles: 20 },
    { chapter: 78, versicles: 72 },
    { chapter: 79, versicles: 13 },
    { chapter: 80, versicles: 19 },
    { chapter: 81, versicles: 16 },
    { chapter: 82, versicles: 8 },
    { chapter: 83, versicles: 18 },
    { chapter: 84, versicles: 12 },
    { chapter: 85, versicles: 13 },
    { chapter: 86, versicles: 17 },
    { chapter: 87, versicles: 7 },
    { chapter: 88, versicles: 18 },
    { chapter: 89, versicles: 52 },
    { chapter: 90, versicles: 17 },
    { chapter: 91, versicles: 16 },
    { chapter: 92, versicles: 15 },
    { chapter: 93, versicles: 5 },
    { chapter: 94, versicles: 23 },
    { chapter: 95, versicles: 11 },
    { chapter: 96, versicles: 13 },
    { chapter: 97, versicles: 12 },
    { chapter: 98, versicles: 9 },
    { chapter: 99, versicles: 9 },
    // { chapter: 100, versicles: 5 },
    // { chapter: 101, versicles: 8 },
    // { chapter: 102, versicles: 28 },
    // { chapter: 103, versicles: 22 },
    // { chapter: 104, versicles: 35 },
    // { chapter: 105, versicles: 45 },
    // { chapter: 106, versicles: 48 },
    // { chapter: 107, versicles: 43 },
    // { chapter: 108, versicles: 13 },
    // { chapter: 109, versicles: 31 },
    // { chapter: 110, versicles: 7 },
    // { chapter: 111, versicles: 10 },
    // { chapter: 112, versicles: 10 },
    // { chapter: 113, versicles: 9 },
    // { chapter: 114, versicles: 8 },
    // { chapter: 115, versicles: 18 },
    // { chapter: 116, versicles: 19 },
    // { chapter: 117, versicles: 2 },
    // { chapter: 118, versicles: 29 },
    // { chapter: 119, versicles: 176 },
    // { chapter: 120, versicles: 7 },
    // { chapter: 121, versicles: 8 },
    // { chapter: 122, versicles: 9 },
    // { chapter: 123, versicles: 4 },
    // { chapter: 124, versicles: 8 },
    // { chapter: 125, versicles: 5 },
    // { chapter: 126, versicles: 6 },
    // { chapter: 127, versicles: 5 },
    // { chapter: 128, versicles: 6 },
    // { chapter: 129, versicles: 8 },
    // { chapter: 130, versicles: 8 },
    // { chapter: 131, versicles: 3 },
    // { chapter: 132, versicles: 18 },
    // { chapter: 133, versicles: 3 },
    // { chapter: 134, versicles: 3 },
    // { chapter: 135, versicles: 21 },
    // { chapter: 136, versicles: 26 },
    // { chapter: 137, versicles: 9 },
    // { chapter: 138, versicles: 8 },
    // { chapter: 139, versicles: 24 },
    // { chapter: 140, versicles: 13 },
    // { chapter: 141, versicles: 10 },
    // { chapter: 142, versicles: 7 },
    // { chapter: 143, versicles: 12 },
    // { chapter: 144, versicles: 15 },
    // { chapter: 145, versicles: 21 },
    // { chapter: 146, versicles: 10 },
    // { chapter: 147, versicles: 20 },
    // { chapter: 148, versicles: 14 },
    // { chapter: 149, versicles: 9 },
    // { chapter: 150, versicles: 6 },
  ],
  pv: [
    { chapter: 1, versicles: 33 },
    { chapter: 2, versicles: 22 },
    { chapter: 3, versicles: 35 },
    { chapter: 4, versicles: 27 },
    { chapter: 5, versicles: 23 },
    { chapter: 6, versicles: 35 },
    { chapter: 7, versicles: 27 },
    { chapter: 8, versicles: 36 },
    { chapter: 9, versicles: 18 },
    { chapter: 10, versicles: 32 },
    { chapter: 11, versicles: 31 },
    { chapter: 12, versicles: 28 },
    { chapter: 13, versicles: 25 },
    { chapter: 14, versicles: 35 },
    { chapter: 15, versicles: 33 },
    { chapter: 16, versicles: 33 },
    { chapter: 17, versicles: 28 },
    { chapter: 18, versicles: 24 },
    { chapter: 19, versicles: 29 },
    { chapter: 20, versicles: 30 },
    { chapter: 21, versicles: 31 },
    { chapter: 22, versicles: 29 },
    { chapter: 23, versicles: 35 },
    { chapter: 24, versicles: 34 },
    { chapter: 25, versicles: 28 },
    { chapter: 26, versicles: 28 },
    { chapter: 27, versicles: 27 },
    { chapter: 28, versicles: 28 },
    { chapter: 29, versicles: 27 },
    { chapter: 30, versicles: 33 },
    { chapter: 31, versicles: 31 },
  ],
  ec: [
    { chapter: 1, versicles: 18 },
    { chapter: 2, versicles: 26 },
    { chapter: 3, versicles: 22 },
    { chapter: 4, versicles: 16 },
    { chapter: 5, versicles: 20 },
    { chapter: 6, versicles: 12 },
    { chapter: 7, versicles: 29 },
    { chapter: 8, versicles: 17 },
    { chapter: 9, versicles: 18 },
    { chapter: 10, versicles: 20 },
    { chapter: 11, versicles: 10 },
    { chapter: 12, versicles: 14 },
  ],
  ct: [
    { chapter: 1, versicles: 17 },
    { chapter: 2, versicles: 17 },
    { chapter: 3, versicles: 11 },
    { chapter: 4, versicles: 16 },
    { chapter: 5, versicles: 16 },
    { chapter: 6, versicles: 13 },
    { chapter: 7, versicles: 13 },
    { chapter: 8, versicles: 14 },
  ],
  is: [
    { chapter: 1, versicles: 31 },
    { chapter: 2, versicles: 22 },
    { chapter: 3, versicles: 26 },
    { chapter: 4, versicles: 6 },
    { chapter: 5, versicles: 30 },
    { chapter: 6, versicles: 13 },
    { chapter: 7, versicles: 25 },
    { chapter: 8, versicles: 22 },
    { chapter: 9, versicles: 21 },
    { chapter: 10, versicles: 34 },
    { chapter: 11, versicles: 16 },
    { chapter: 12, versicles: 6 },
    { chapter: 13, versicles: 22 },
    { chapter: 14, versicles: 32 },
    { chapter: 15, versicles: 9 },
    { chapter: 16, versicles: 14 },
    { chapter: 17, versicles: 14 },
    { chapter: 18, versicles: 7 },
    { chapter: 19, versicles: 25 },
    { chapter: 20, versicles: 6 },
    { chapter: 21, versicles: 17 },
    { chapter: 22, versicles: 25 },
    { chapter: 23, versicles: 18 },
    { chapter: 24, versicles: 23 },
    { chapter: 25, versicles: 12 },
    { chapter: 26, versicles: 21 },
    { chapter: 27, versicles: 13 },
    { chapter: 28, versicles: 29 },
    { chapter: 29, versicles: 24 },
    { chapter: 30, versicles: 33 },
    { chapter: 31, versicles: 9 },
    { chapter: 32, versicles: 20 },
    { chapter: 33, versicles: 24 },
    { chapter: 34, versicles: 17 },
    { chapter: 35, versicles: 10 },
    { chapter: 36, versicles: 22 },
    { chapter: 37, versicles: 38 },
    { chapter: 38, versicles: 22 },
    { chapter: 39, versicles: 8 },
    { chapter: 40, versicles: 31 },
    { chapter: 41, versicles: 29 },
    { chapter: 42, versicles: 25 },
    { chapter: 43, versicles: 28 },
    { chapter: 44, versicles: 28 },
    { chapter: 45, versicles: 25 },
    { chapter: 46, versicles: 13 },
    { chapter: 47, versicles: 15 },
    { chapter: 48, versicles: 22 },
    { chapter: 49, versicles: 26 },
    { chapter: 50, versicles: 11 },
    { chapter: 51, versicles: 23 },
    { chapter: 52, versicles: 15 },
    { chapter: 53, versicles: 12 },
    { chapter: 54, versicles: 17 },
    { chapter: 55, versicles: 13 },
    { chapter: 56, versicles: 12 },
    { chapter: 57, versicles: 21 },
    { chapter: 58, versicles: 14 },
    { chapter: 59, versicles: 21 },
    { chapter: 60, versicles: 22 },
    { chapter: 61, versicles: 11 },
    { chapter: 62, versicles: 12 },
    { chapter: 63, versicles: 19 },
    { chapter: 64, versicles: 12 },
    { chapter: 65, versicles: 25 },
    { chapter: 66, versicles: 24 },
  ],
  jr: [
    { chapter: 1, versicles: 19 },
    { chapter: 2, versicles: 37 },
    { chapter: 3, versicles: 25 },
    { chapter: 4, versicles: 31 },
    { chapter: 5, versicles: 31 },
    { chapter: 6, versicles: 30 },
    { chapter: 7, versicles: 34 },
    { chapter: 8, versicles: 22 },
    { chapter: 9, versicles: 26 },
    { chapter: 10, versicles: 25 },
    { chapter: 11, versicles: 23 },
    { chapter: 12, versicles: 17 },
    { chapter: 13, versicles: 27 },
    { chapter: 14, versicles: 22 },
    { chapter: 15, versicles: 21 },
    { chapter: 16, versicles: 21 },
    { chapter: 17, versicles: 27 },
    { chapter: 18, versicles: 23 },
    { chapter: 19, versicles: 15 },
    { chapter: 20, versicles: 18 },
    { chapter: 21, versicles: 14 },
    { chapter: 22, versicles: 30 },
    { chapter: 23, versicles: 40 },
    { chapter: 24, versicles: 10 },
    { chapter: 25, versicles: 38 },
    { chapter: 26, versicles: 24 },
    { chapter: 27, versicles: 22 },
    { chapter: 28, versicles: 17 },
    { chapter: 29, versicles: 32 },
    { chapter: 30, versicles: 24 },
    { chapter: 31, versicles: 40 },
    { chapter: 32, versicles: 44 },
    { chapter: 33, versicles: 26 },
    { chapter: 34, versicles: 22 },
    { chapter: 35, versicles: 19 },
    { chapter: 36, versicles: 32 },
    { chapter: 37, versicles: 21 },
    { chapter: 38, versicles: 28 },
    { chapter: 39, versicles: 18 },
    { chapter: 40, versicles: 16 },
    { chapter: 41, versicles: 18 },
    { chapter: 42, versicles: 22 },
    { chapter: 43, versicles: 13 },
    { chapter: 44, versicles: 30 },
    { chapter: 45, versicles: 5 },
    { chapter: 46, versicles: 28 },
    { chapter: 47, versicles: 7 },
    { chapter: 48, versicles: 47 },
    { chapter: 49, versicles: 39 },
    { chapter: 50, versicles: 46 },
    { chapter: 51, versicles: 64 },
    { chapter: 52, versicles: 34 },
  ],
  lm: [
    { chapter: 1, versicles: 22 },
    { chapter: 2, versicles: 22 },
    { chapter: 3, versicles: 66 },
    { chapter: 4, versicles: 22 },
    { chapter: 5, versicles: 22 },
  ],
  ez: [
    { chapter: 1, versicles: 28 },
    { chapter: 2, versicles: 10 },
    { chapter: 3, versicles: 27 },
    { chapter: 4, versicles: 17 },
    { chapter: 5, versicles: 17 },
    { chapter: 6, versicles: 14 },
    { chapter: 7, versicles: 27 },
    { chapter: 8, versicles: 18 },
    { chapter: 9, versicles: 11 },
    { chapter: 10, versicles: 22 },
    { chapter: 11, versicles: 25 },
    { chapter: 12, versicles: 28 },
    { chapter: 13, versicles: 23 },
    { chapter: 14, versicles: 23 },
    { chapter: 15, versicles: 8 },
    { chapter: 16, versicles: 63 },
    { chapter: 17, versicles: 24 },
    { chapter: 18, versicles: 32 },
    { chapter: 19, versicles: 14 },
    { chapter: 20, versicles: 49 },
    { chapter: 21, versicles: 32 },
    { chapter: 22, versicles: 31 },
    { chapter: 23, versicles: 49 },
    { chapter: 24, versicles: 27 },
    { chapter: 25, versicles: 17 },
    { chapter: 26, versicles: 21 },
    { chapter: 27, versicles: 36 },
    { chapter: 28, versicles: 26 },
    { chapter: 29, versicles: 21 },
    { chapter: 30, versicles: 26 },
    { chapter: 31, versicles: 18 },
    { chapter: 32, versicles: 32 },
    { chapter: 33, versicles: 33 },
    { chapter: 34, versicles: 31 },
    { chapter: 35, versicles: 15 },
    { chapter: 36, versicles: 38 },
    { chapter: 37, versicles: 28 },
    { chapter: 38, versicles: 23 },
    { chapter: 39, versicles: 29 },
    { chapter: 40, versicles: 49 },
    { chapter: 41, versicles: 26 },
    { chapter: 42, versicles: 20 },
    { chapter: 43, versicles: 27 },
    { chapter: 44, versicles: 31 },
    { chapter: 45, versicles: 25 },
    { chapter: 46, versicles: 24 },
    { chapter: 47, versicles: 23 },
    { chapter: 48, versicles: 35 },
  ],
  dn: [
    { chapter: 1, versicles: 21 },
    { chapter: 2, versicles: 49 },
    { chapter: 3, versicles: 30 },
    { chapter: 4, versicles: 37 },
    { chapter: 5, versicles: 31 },
    { chapter: 6, versicles: 28 },
    { chapter: 7, versicles: 28 },
    { chapter: 8, versicles: 27 },
    { chapter: 9, versicles: 27 },
    { chapter: 10, versicles: 21 },
    { chapter: 11, versicles: 45 },
    { chapter: 12, versicles: 13 },
  ],
  os: [
    { chapter: 1, versicles: 11 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 5 },
    { chapter: 4, versicles: 19 },
    { chapter: 5, versicles: 15 },
    { chapter: 6, versicles: 11 },
    { chapter: 7, versicles: 16 },
    { chapter: 8, versicles: 14 },
    { chapter: 9, versicles: 17 },
    { chapter: 10, versicles: 15 },
    { chapter: 11, versicles: 12 },
    { chapter: 12, versicles: 14 },
    { chapter: 13, versicles: 16 },
    { chapter: 14, versicles: 9 },
  ],
  jl: [
    { chapter: 1, versicles: 20 },
    { chapter: 2, versicles: 32 },
    { chapter: 3, versicles: 21 },
  ],
  am: [
    { chapter: 1, versicles: 15 },
    { chapter: 2, versicles: 16 },
    { chapter: 3, versicles: 15 },
    { chapter: 4, versicles: 13 },
    { chapter: 5, versicles: 27 },
    { chapter: 6, versicles: 14 },
    { chapter: 7, versicles: 17 },
    { chapter: 8, versicles: 14 },
    { chapter: 9, versicles: 15 },
  ],
  ob: [{ chapter: 1, versicles: 21 }],
  jn: [
    { chapter: 1, versicles: 17 },
    { chapter: 2, versicles: 10 },
    { chapter: 3, versicles: 10 },
    { chapter: 4, versicles: 11 },
  ],
  mq: [
    { chapter: 1, versicles: 16 },
    { chapter: 2, versicles: 13 },
    { chapter: 3, versicles: 12 },
    { chapter: 4, versicles: 13 },
    { chapter: 5, versicles: 15 },
    { chapter: 6, versicles: 16 },
    { chapter: 7, versicles: 20 },
  ],
  na: [
    { chapter: 1, versicles: 15 },
    { chapter: 2, versicles: 13 },
    { chapter: 3, versicles: 19 },
  ],
  hc: [
    { chapter: 1, versicles: 17 },
    { chapter: 2, versicles: 20 },
    { chapter: 3, versicles: 19 },
  ],
  sf: [
    { chapter: 1, versicles: 18 },
    { chapter: 2, versicles: 15 },
    { chapter: 3, versicles: 20 },
  ],
  ag: [
    { chapter: 1, versicles: 15 },
    { chapter: 2, versicles: 23 },
  ],
  zc: [
    { chapter: 1, versicles: 21 },
    { chapter: 2, versicles: 13 },
    { chapter: 3, versicles: 10 },
    { chapter: 4, versicles: 14 },
    { chapter: 5, versicles: 11 },
    { chapter: 6, versicles: 15 },
    { chapter: 7, versicles: 14 },
    { chapter: 8, versicles: 23 },
    { chapter: 9, versicles: 17 },
    { chapter: 10, versicles: 12 },
    { chapter: 11, versicles: 17 },
    { chapter: 12, versicles: 14 },
    { chapter: 13, versicles: 9 },
    { chapter: 14, versicles: 21 },
  ],
  ml: [
    { chapter: 1, versicles: 14 },
    { chapter: 2, versicles: 17 },
    { chapter: 3, versicles: 18 },
    { chapter: 4, versicles: 6 },
  ],
  mt: [
    { chapter: 1, versicles: 25 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 17 },
    { chapter: 4, versicles: 25 },
    { chapter: 5, versicles: 48 },
    { chapter: 6, versicles: 34 },
    { chapter: 7, versicles: 29 },
    { chapter: 8, versicles: 34 },
    { chapter: 9, versicles: 38 },
    { chapter: 10, versicles: 42 },
    { chapter: 11, versicles: 30 },
    { chapter: 12, versicles: 50 },
    { chapter: 13, versicles: 58 },
    { chapter: 14, versicles: 36 },
    { chapter: 15, versicles: 39 },
    { chapter: 16, versicles: 28 },
    { chapter: 17, versicles: 27 },
    { chapter: 18, versicles: 35 },
    { chapter: 19, versicles: 30 },
    { chapter: 20, versicles: 34 },
    { chapter: 21, versicles: 46 },
    { chapter: 22, versicles: 46 },
    { chapter: 23, versicles: 39 },
    { chapter: 24, versicles: 51 },
    { chapter: 25, versicles: 46 },
    { chapter: 26, versicles: 75 },
    { chapter: 27, versicles: 66 },
    { chapter: 28, versicles: 20 },
  ],
  mc: [
    { chapter: 1, versicles: 45 },
    { chapter: 2, versicles: 28 },
    { chapter: 3, versicles: 35 },
    { chapter: 4, versicles: 41 },
    { chapter: 5, versicles: 43 },
    { chapter: 6, versicles: 56 },
    { chapter: 7, versicles: 37 },
    { chapter: 8, versicles: 38 },
    { chapter: 9, versicles: 50 },
    { chapter: 10, versicles: 52 },
    { chapter: 11, versicles: 33 },
    { chapter: 12, versicles: 44 },
    { chapter: 13, versicles: 37 },
    { chapter: 14, versicles: 72 },
    { chapter: 15, versicles: 47 },
    { chapter: 16, versicles: 20 },
  ],
  lc: [
    { chapter: 1, versicles: 80 },
    { chapter: 2, versicles: 52 },
    { chapter: 3, versicles: 38 },
    { chapter: 4, versicles: 44 },
    { chapter: 5, versicles: 39 },
    { chapter: 6, versicles: 49 },
    { chapter: 7, versicles: 50 },
    { chapter: 8, versicles: 56 },
    { chapter: 9, versicles: 62 },
    { chapter: 10, versicles: 42 },
    { chapter: 11, versicles: 54 },
    { chapter: 12, versicles: 59 },
    { chapter: 13, versicles: 35 },
    { chapter: 14, versicles: 35 },
    { chapter: 15, versicles: 32 },
    { chapter: 16, versicles: 31 },
    { chapter: 17, versicles: 37 },
    { chapter: 18, versicles: 43 },
    { chapter: 19, versicles: 48 },
    { chapter: 20, versicles: 47 },
    { chapter: 21, versicles: 38 },
    { chapter: 22, versicles: 71 },
    { chapter: 23, versicles: 56 },
    { chapter: 24, versicles: 53 },
  ],
  jo: [
    { chapter: 1, versicles: 51 },
    { chapter: 2, versicles: 25 },
    { chapter: 3, versicles: 36 },
    { chapter: 4, versicles: 54 },
    { chapter: 5, versicles: 47 },
    { chapter: 6, versicles: 71 },
    { chapter: 7, versicles: 53 },
    { chapter: 8, versicles: 59 },
    { chapter: 9, versicles: 41 },
    { chapter: 10, versicles: 42 },
    { chapter: 11, versicles: 57 },
    { chapter: 12, versicles: 50 },
    { chapter: 13, versicles: 38 },
    { chapter: 14, versicles: 31 },
    { chapter: 15, versicles: 27 },
    { chapter: 16, versicles: 33 },
    { chapter: 17, versicles: 26 },
    { chapter: 18, versicles: 40 },
    { chapter: 19, versicles: 42 },
    { chapter: 20, versicles: 31 },
    { chapter: 21, versicles: 25 },
  ],
  at: [
    { chapter: 1, versicles: 26 },
    { chapter: 2, versicles: 47 },
    { chapter: 3, versicles: 26 },
    { chapter: 4, versicles: 37 },
    { chapter: 5, versicles: 42 },
    { chapter: 6, versicles: 15 },
    { chapter: 7, versicles: 60 },
    { chapter: 8, versicles: 40 },
    { chapter: 9, versicles: 43 },
    { chapter: 10, versicles: 48 },
    { chapter: 11, versicles: 30 },
    { chapter: 12, versicles: 25 },
    { chapter: 13, versicles: 52 },
    { chapter: 14, versicles: 28 },
    { chapter: 15, versicles: 41 },
    { chapter: 16, versicles: 40 },
    { chapter: 17, versicles: 34 },
    { chapter: 18, versicles: 28 },
    { chapter: 19, versicles: 41 },
    { chapter: 20, versicles: 38 },
    { chapter: 21, versicles: 40 },
    { chapter: 22, versicles: 30 },
    { chapter: 23, versicles: 35 },
    { chapter: 24, versicles: 27 },
    { chapter: 25, versicles: 27 },
    { chapter: 26, versicles: 32 },
    { chapter: 27, versicles: 44 },
    { chapter: 28, versicles: 31 },
  ],
  rm: [
    { chapter: 1, versicles: 32 },
    { chapter: 2, versicles: 29 },
    { chapter: 3, versicles: 31 },
    { chapter: 4, versicles: 25 },
    { chapter: 5, versicles: 21 },
    { chapter: 6, versicles: 23 },
    { chapter: 7, versicles: 25 },
    { chapter: 8, versicles: 39 },
    { chapter: 9, versicles: 33 },
    { chapter: 10, versicles: 21 },
    { chapter: 11, versicles: 36 },
    { chapter: 12, versicles: 21 },
    { chapter: 13, versicles: 14 },
    { chapter: 14, versicles: 23 },
    { chapter: 15, versicles: 33 },
    { chapter: 16, versicles: 27 },
  ],
  // "1co": [
  //   { chapter: 1, versicles: 31 },
  //   { chapter: 2, versicles: 16 },
  //   { chapter: 3, versicles: 23 },
  //   { chapter: 4, versicles: 21 },
  //   { chapter: 5, versicles: 13 },
  //   { chapter: 6, versicles: 20 },
  //   { chapter: 7, versicles: 40 },
  //   { chapter: 8, versicles: 13 },
  //   { chapter: 9, versicles: 27 },
  //   { chapter: 10, versicles: 33 },
  //   { chapter: 11, versicles: 34 },
  //   { chapter: 12, versicles: 31 },
  //   { chapter: 13, versicles: 13 },
  //   { chapter: 14, versicles: 40 },
  //   { chapter: 15, versicles: 58 },
  //   { chapter: 16, versicles: 24 },
  // ],
  // "2co": [
  //   { chapter: 1, versicles: 24 },
  //   { chapter: 2, versicles: 17 },
  //   { chapter: 3, versicles: 18 },
  //   { chapter: 4, versicles: 18 },
  //   { chapter: 5, versicles: 21 },
  //   { chapter: 6, versicles: 18 },
  //   { chapter: 7, versicles: 16 },
  //   { chapter: 8, versicles: 24 },
  //   { chapter: 9, versicles: 15 },
  //   { chapter: 10, versicles: 18 },
  //   { chapter: 11, versicles: 33 },
  //   { chapter: 12, versicles: 21 },
  //   { chapter: 13, versicles: 14 },
  // ],
  gl: [
    { chapter: 1, versicles: 24 },
    { chapter: 2, versicles: 21 },
    { chapter: 3, versicles: 29 },
    { chapter: 4, versicles: 31 },
    { chapter: 5, versicles: 26 },
    { chapter: 6, versicles: 18 },
  ],
  ef: [
    { chapter: 1, versicles: 23 },
    { chapter: 2, versicles: 22 },
    { chapter: 3, versicles: 21 },
    { chapter: 4, versicles: 32 },
    { chapter: 5, versicles: 33 },
    { chapter: 6, versicles: 24 },
  ],
  fp: [
    { chapter: 1, versicles: 30 },
    { chapter: 2, versicles: 30 },
    { chapter: 3, versicles: 21 },
    { chapter: 4, versicles: 23 },
  ],
  cl: [
    { chapter: 1, versicles: 29 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 25 },
    { chapter: 4, versicles: 18 },
  ],
  // "1ts": [
  //   { chapter: 1, versicles: 10 },
  //   { chapter: 2, versicles: 20 },
  //   { chapter: 3, versicles: 13 },
  //   { chapter: 4, versicles: 18 },
  //   { chapter: 5, versicles: 28 },
  // ],
  // "2ts": [
  //   { chapter: 1, versicles: 12 },
  //   { chapter: 2, versicles: 17 },
  //   { chapter: 3, versicles: 18 },
  // ],
  // "1tm": [
  //   { chapter: 1, versicles: 20 },
  //   { chapter: 2, versicles: 15 },
  //   { chapter: 3, versicles: 16 },
  //   { chapter: 4, versicles: 16 },
  //   { chapter: 5, versicles: 25 },
  //   { chapter: 6, versicles: 21 },
  // ],
  // "2tm": [
  //   { chapter: 1, versicles: 18 },
  //   { chapter: 2, versicles: 26 },
  //   { chapter: 3, versicles: 17 },
  //   { chapter: 4, versicles: 22 },
  // ],
  tt: [
    { chapter: 1, versicles: 16 },
    { chapter: 2, versicles: 15 },
    { chapter: 3, versicles: 15 },
  ],
  fm: [{ chapter: 1, versicles: 25 }],
  hb: [
    { chapter: 1, versicles: 14 },
    { chapter: 2, versicles: 18 },
    { chapter: 3, versicles: 19 },
    { chapter: 4, versicles: 16 },
    { chapter: 5, versicles: 14 },
    { chapter: 6, versicles: 20 },
    { chapter: 7, versicles: 28 },
    { chapter: 8, versicles: 13 },
    { chapter: 9, versicles: 28 },
    { chapter: 10, versicles: 39 },
    { chapter: 11, versicles: 40 },
    { chapter: 12, versicles: 29 },
    { chapter: 13, versicles: 25 },
  ],
  tg: [
    { chapter: 1, versicles: 27 },
    { chapter: 2, versicles: 26 },
    { chapter: 3, versicles: 18 },
    { chapter: 4, versicles: 17 },
    { chapter: 5, versicles: 20 },
  ],
  // "1pe": [
  //   { chapter: 1, versicles: 25 },
  //   { chapter: 2, versicles: 25 },
  //   { chapter: 3, versicles: 22 },
  //   { chapter: 4, versicles: 19 },
  //   { chapter: 5, versicles: 14 },
  // ],
  // "2pe": [
  //   { chapter: 1, versicles: 21 },
  //   { chapter: 2, versicles: 22 },
  //   { chapter: 3, versicles: 18 },
  // ],
  // "1jo": [
  //   { chapter: 1, versicles: 10 },
  //   { chapter: 2, versicles: 29 },
  //   { chapter: 3, versicles: 24 },
  //   { chapter: 4, versicles: 21 },
  //   { chapter: 5, versicles: 21 },
  // ],
  // "2jo": [{ chapter: 1, versicles: 13 }],
  // "3jo": [{ chapter: 1, versicles: 15 }],
  jd: [{ chapter: 1, versicles: 25 }],
  ap: [
    { chapter: 1, versicles: 20 },
    { chapter: 2, versicles: 29 },
    { chapter: 3, versicles: 22 },
    { chapter: 4, versicles: 11 },
    { chapter: 5, versicles: 14 },
    { chapter: 6, versicles: 17 },
    { chapter: 7, versicles: 17 },
    { chapter: 8, versicles: 13 },
    { chapter: 9, versicles: 21 },
    { chapter: 10, versicles: 11 },
    { chapter: 11, versicles: 19 },
    { chapter: 12, versicles: 18 },
    { chapter: 13, versicles: 18 },
    { chapter: 14, versicles: 20 },
    { chapter: 15, versicles: 8 },
    { chapter: 16, versicles: 21 },
    { chapter: 17, versicles: 18 },
    { chapter: 18, versicles: 24 },
    { chapter: 19, versicles: 21 },
    { chapter: 20, versicles: 15 },
    { chapter: 21, versicles: 27 },
    { chapter: 22, versicles: 21 },
  ],
};

async function startUp() {
  const main = document.getElementById("game");

  setState();

  const { book, chapter, verse } = getRandomVerse();

  setSecret(book, chapter, verse);

  await drawVersicle(main, book, chapter, verse);

  drawGrid(main, global.chances, global.boxes);

  drawKeyboard(main);

  keyboardEvent();

  const state = getState();

  if (state.won || state.gameOver) {
    if (state.gameOver) showAnswer();
    showStatsModal();
  }

  hideStatsModal();
  hideSettingsModal();
}

function updateState(key, value) {
  const state = JSON.parse(localStorage.getItem("state"));

  localStorage.setItem(
    "state",
    JSON.stringify({
      ...state,
      [key]: value,
    })
  );
}

function updateCurrentColumn(value) {
  const state = JSON.parse(localStorage.getItem("state"));

  localStorage.setItem(
    "state",
    JSON.stringify({
      ...state,
      currentColumn: value >= 0 ? value : state.currentColumn + 1,
    })
  );
}

function updateCurrentRow(value) {
  const state = JSON.parse(localStorage.getItem("state"));

  localStorage.setItem(
    "state",
    JSON.stringify({
      ...state,
      currentRow: value >= 0 ? value : state.currentRow + 1,
    })
  );
}

function setState() {
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  let timeUntilMidnight = tomorrow.getTime() - Date.now();

  const state = JSON.parse(localStorage.getItem("state"));

  if (!state || Date.now() >= state.expirationTime || !state.expirationTime) {
    localStorage.setItem(
      "state",
      JSON.stringify({
        currentRow: 0,
        currentColumn: 0,
        grid: Array(6)
          .fill()
          .map(() => Array(6).fill("")),
        versicle: "",
        won: false,
        gameOver: false,
        currentGame: getSequentialNumber(),
        expirationTime: Date.now() + timeUntilMidnight,
      })
    );
  }
}

function getState() {
  return JSON.parse(localStorage.getItem("state"));
}

function bookException(book) {
  if (book === "jó") {
    return 'job'
  }

  return book;
}

async function drawVersicle(container, book, chapter, verse) {
  let { versicle: verseText } = getState();

  book = bookException(book);

  console.log(verseText);

  if (!verseText || verseText === "") {
    const data = await fetch(
      `https://www.abibliadigital.com.br/api/verses/nvi/${book}/${chapter}/${verse}`
    );

    const versicle = await data.json();
    verseText = versicle.text;

    updateState("answer", getAnswer(versicle));

    updateState("versicle", versicle.text);
  }

  const versicleText = document.createElement("h2");
  versicleText.textContent = `"${verseText}"`;

  const versicleContainer = document.createElement("div");
  versicleContainer.className = "versicle";

  versicleContainer.appendChild(versicleText);

  container.appendChild(versicleContainer);
}

function getAnswer(versicle) {
  let answer = "";

  answer += versicle.book.name + " ";
  answer += versicle.chapter + ":";
  answer += versicle.number;

  return answer;
}

function keyboardEvent() {
  document.body.onkeyup = (event) => {
    const { currentColumn } = getState();
    const isLetter = (key) => key.match(/[a-z]/i) && key.length === 1;
    const isNumber = (key) => key.match(/^\d$/) && key.length === 1;

    if (isLetter(event.key) && currentColumn < 2) {
      addLetter(event.key);
    }

    if (
      isNumber(event.key) &&
      currentColumn >= 2 &&
      currentColumn < global.boxes
    ) {
      addLetter(event.key);
    }

    if (event.key === "Backspace") {
      removeLetter();
    }

    if (event.key === "Enter") {
      onEnter();
    }

    updateBox();
  };
}

function drawGrid(container, chances, boxes) {
  const grid = document.createElement("div");

  grid.className = "grid";

  // const adwidth =
  //   window.innerWidth > 420 ? "20%" : window.innerWidth < 380 ? "0" : "8%";

  // grid.innerHTML = `
  //   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4020170826821314"
  //       crossorigin="anonymous"></script>
  //   <!-- Laterais -->
  //   <ins class="adsbygoogle"
  //       style="display:block;width:${adwidth}"
  //       data-ad-client="ca-pub-4020170826821314"
  //       data-ad-slot="4970214821"
  //       data-ad-format="auto"
  //       data-full-width-responsive="true"></ins>
  //   <script>
  //       (adsbygoogle = window.adsbygoogle || []).push({});
  //   </script>
  // `;

  // grid.appendChild(ad);

  for (let i = 0; i < chances; i++) {
    for (let j = 0; j < boxes; j++) {
      const box = drawBox(i, j);

      if (j === 1) {
        box.classList.add("space");
      }
      if (j === 4) {
        const colon = document.createElement("p");
        colon.className = "colon";
        colon.textContent = ":";
        grid.appendChild(colon);
      }
      grid.appendChild(box);
    }
  }

  // grid.innerHTML += `
  //   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4020170826821314"
  //       crossorigin="anonymous"></script>
  //   <!-- Laterais -->
  //   <ins class="adsbygoogle ads-right"
  //       style="display:block;width:${adwidth};"
  //       data-ad-client="ca-pub-4020170826821314"
  //       data-ad-slot="4970214821"
  //       data-ad-format="auto"
  //       data-full-width-responsive="true"></ins>
  //   <script>
  //       (adsbygoogle = window.adsbygoogle || []).push({});
  //   </script>
  // `;

  container.appendChild(grid);
}

function drawBox(row, column) {
  const { grid, secret, currentColumn, currentRow } = getState();
  const box = document.createElement(`div`);
  const letter = grid[row][column];
  let updatedSecret = getUpdatedSecret();

  box.className = "box";
  box.id = `box${row}${column}`;

  if (letter) {
    box.textContent = letter;

    if (grid[row][column] === secret[column]) {
      box.classList.add("right");
    } else if (updatedSecret.includes(letter)) {
      box.classList.add("parcial");
      updatedSecret[updatedSecret.indexOf(letter)] = "";
    } else {
      box.classList.add("wrong");
    }
  }

  if (row === currentRow && column === currentColumn) {
    box.classList.add("focus");
  }

  if (row === currentRow) {
    box.classList.add("active");
  }

  box.ariaLive = "polite"
  box.role = "text"

  return box;
}

function drawKeyboard(container) {
  const keyboard = document.createElement("div");
  keyboard.className = "keyboard";

  const keys = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Backspace"],
    ["Z", "X", "C", "V", "B", "N", "M", "Enter"],
  ];

  for (let i = 0; i < keys.length; i++) {
    const keyboardRow = document.createElement("div");
    keyboardRow.className = "keyboard-row";

    for (const key of keys[i]) {
      const keyButton = document.createElement("button");
      keyButton.classList.add("key");
      keyButton.id = key;
      keyButton.textContent = key === "Backspace" ? "←" : key;

      keyButton.onclick = () => keyboardClick(key);

      keyboardRow.appendChild(keyButton);
    }

    keyboard.appendChild(keyboardRow);
  }

  container.appendChild(keyboard);
}

function updateKeyboard() {
  const { currentRow, secret } = getState();

  for (let i = 0; i < global.boxes; i++) {
    const box = document.getElementById(`box${currentRow - 1}${i}`);
    const letter = box.textContent;
    const key = document.getElementById(letter);

    if (letter === secret[i]) {
      key.classList.add("key-right");
    } else if (secret.includes(letter)) {
      key.classList.add("key-parcial");
    } else {
      key.classList.add("key-wrong");
    }
  }
}

function keyboardClick(key) {
  const event = new KeyboardEvent("keyup", { key: key });
  document.body.dispatchEvent(event);
}

function addLetter(letter) {
  const { currentColumn, currentRow, grid } = getState();

  grid[currentRow][currentColumn] = letter.toUpperCase();

  updateState("grid", grid);

  if (currentColumn < global.boxes) updateCurrentColumn();
}

function onEnter() {
  const { grid, currentRow } = getState();

  const word = grid[currentRow];

  if (!validateBook(word) || word.join("").length !== global.boxes) {
    cleanRow();
  } else {
    revealWord(word);
  }
}

function getUpdatedSecret() {
  const { secret, currentRow } = getState();
  let updatedSecret = [...secret];

  for (let i = 0; i < global.boxes; i++) {
    const letter =
      document.getElementById(`box${currentRow}${i}`)?.textContent || "";

    if (letter === secret[i]) {
      updatedSecret[i] = "";
    }
  }

  return updatedSecret;
}

function revealWord(guess) {
  const { secret, currentRow, currentColumn } = getState();
  const animationDelay = 500;
  const finishDelay = (7 * animationDelay) / 2;
  let updatedSecret = getUpdatedSecret();

  for (let i = 0; i < global.boxes; i++) {
    const box = document.getElementById(`box${currentRow}${i}`);
    const letter = box.textContent;

    setTimeout(() => {
      if (letter === secret[i]) {
        box.classList.add("right");
      } else if (updatedSecret.includes(letter)) {
        box.classList.add("parcial");
        updatedSecret[updatedSecret.indexOf(letter)] = "";
      } else {
        box.classList.add("wrong");
      }
    }, ((i + 1) * animationDelay) / 2);

    box.classList.add("animated");
    box.style.animationDelay = `${(i * animationDelay) / 2}ms`;
  }

  setTimeout(() => {
    updateKeyboard();
  }, finishDelay);

  const win = guess.join("") === secret.join("");
  const gameOver = currentRow === 5;

  if (win) {
    setTimeout(() => {
      setGameWin();
      updateState("won", true);
      updateStats();
    }, finishDelay);
    setTimeout(() => {
      showStatsModal();
    }, finishDelay + 1000);
  } else if (gameOver) {
    updateState("gameOver", true);
    updateStats();
    showStatsModal();
    showAnswer();
  } else {
    setTimeout(() => {
      changeActiveRow();
    }, finishDelay);

    updateCurrentRow();
    updateCurrentColumn(0);
  }
}

function updateStats() {
  const stats = JSON.parse(localStorage.getItem("stats"));
  const { won, gameOver, currentGame } = getState();

  if (!stats) {
    localStorage.setItem(
      "stats",
      JSON.stringify({
        winStreak: won ? 1 : 0,
        games: 1,
        wins: won ? 1 : 0,
        maxStreak: won ? 1 : 0,
        lastWin: won ? currentGame : null,
      })
    );
  } else {
    const winStreak = gameOver
      ? 0
      : won && stats.lastWin + 1 === currentGame
      ? (stats.winStreak === 0 ? 1 : stats.winStreak) + 1
      : 1;
    const maxStreak = stats.maxStreak > winStreak ? stats.maxStreak : winStreak;
    localStorage.setItem(
      "stats",
      JSON.stringify({
        winStreak,
        games: stats.games + 1,
        wins: stats.wins + (won ? 1 : 0),
        maxStreak,
        lastWin: won ? currentGame : stats.lastWin,
      })
    );
  }

  const createdStats = JSON.parse(localStorage.getItem("stats"));
  gtag("event", "user_stats", createdStats);
}

function getStats() {
  return JSON.parse(localStorage.getItem("stats"));
}

function changeActiveRow() {
  const { currentRow } = getState();
  for (let i = 0; i < global.boxes; i++) {
    const box = document.getElementById(`box${currentRow}${i}`);

    box.classList.add("active");

    if (i === 0) {
      box.classList.add("focus");
    }
  }
}

function setGameWin() {
  const { currentRow } = getState();

  for (let i = 0; i < global.boxes; i += 1) {
    const box = document.getElementById(`box${currentRow}${i}`);
    box.style.animationDelay = `0ms`;
    box.classList.add("win-animated");
  }
}

function showAnswer() {
  const { answer } = getState();
  const body = document.getElementsByTagName("body")[0];
  const tag = document.createElement("div");
  const tagText = document.createElement("h4");
  tag.id = "tag";
  tagText.textContent = answer;
  tag.appendChild(tagText);
  body.appendChild(tag);
}

function showAlert(alert) {
  const body = document.getElementsByTagName("body")[0];
  const alertTag = document.createElement("div");
  const alertText = document.createElement("h4");
  alertTag.id = "alert";
  alertText.textContent = alert;
  alertTag.appendChild(alertText);
  body.appendChild(alertTag);
}

function cleanRow() {
  const { grid, currentRow } = getState();

  for (let i = 0; i < global.boxes; i += 1) {
    grid[currentRow][i] = "";
    updateState("grid", grid);

    const box = document.getElementById(`box${currentRow}${i}`);
    box.classList.add("empty-animated");

    setTimeout(() => {
      box.classList.remove("empty-animated");
    }, 550);
  }

  updateCurrentColumn(0);
}

function validateBook(word) {
  const books = Object.keys(bible).map((abbrv) => abbrv.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  const book = word.slice(0, 2).join("");
  return books.includes(book);
}

function removeLetter() {
  const { grid, currentColumn, currentRow } = getState();

  if (currentColumn > 0) updateCurrentColumn(currentColumn - 1);
  grid[currentRow][currentColumn - 1] = "";
  updateState("grid", grid);
}

function updateBox() {
  const { grid, currentRow, currentColumn } = getState();

  for (let i = 0; i < global.chances; i += 1) {
    for (let j = 0; j < global.boxes; j += 1) {
      const box = document.getElementById(`box${i}${j}`);

      if (i === currentRow && j === currentColumn && j === 1) {
        box.classList.add("focus");
      } else {
        box.classList.remove("focus");
      }

      const letter = grid[i][j];
      box.textContent = letter;
    }
  }
}

async function createShareContent() {
  gtag("event", "share_button_click", {
    event_category: "Social",
    event_label: "User clicked the share button",
  });

  const stats = getStats();
  const { currentGame, versicle } = getState();

  const shareData = {
    title: "Biblio",
    text: "",
    url: "",
  };

  let shareText = `Joguei bibliooo.com.br #${currentGame} 🔥${stats.winStreak}\n\n`;

  for (let i = 0; i < global.chances; i += 1) {
    let linUsed = false;
    for (let j = 0; j < global.boxes; j += 1) {
      const box = document.getElementById(`box${i}${j}`);

      if (box && box.textContent) {
        linUsed = true;
        const classList = box.classList;
        let square;

        if (classList.contains("wrong")) {
          square = "⬛";
        } else if (classList.contains("right")) {
          square = "🟩";
        } else if (classList.contains("parcial")) {
          square = "🟨";
        }

        shareText += square;
      }
    }

    if (linUsed) shareText += "\n";
  }

  shareText += `\n"${versicle}"\n`;

  shareData.text = shareText;

  try {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      await navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareText);
      showAlert("Texto copiado!");
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

function getSequentialNumber() {
  const dayOne = getDateOne();
  const currentDate = new Date();

  const dayDifference = Math.floor(
    (currentDate - dayOne) / (1000 * 60 * 60 * 24)
  );

  const sequentialNumber = dayDifference + 1;

  return sequentialNumber;
}

function getRandomVerse() {
  const actualDate = getUserDate().toISOString().slice(0, 10);
  const hash = hashCode(actualDate);

  const books = Object.keys(bible);
  const booksIndex = ((hash % books.length) + books.length) % books.length;
  const book = books[booksIndex];

  const chapters = bible[book];
  const chapterIndex =
    (((hash >> 16) % chapters.length) + chapters.length) % chapters.length;
  const { chapter, versicles } = bible[book][chapterIndex];

  const verse = ((((hash >> 8) % versicles) + versicles) % versicles);

  return { book, chapter: chapter || 1, verse: verse || 1 };
}

function setSecret(book, chapter, verse) {
  let answer = "";

  answer += book.slice(0, 2).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');;
  answer += chapter.toString().length === 2 ? chapter : "0" + chapter;
  answer += verse.toString().length === 2 ? verse : "0" + verse;

  updateState("secret", answer.split(""));
}

function showStatsModal() {
  const stats = getStats();
  const state = getState();
  const percentage = (stats.wins * 100) / stats.games;

  const modal = document.getElementById("modal");
  const modalHeader = document.getElementsByClassName("modal-title")[0];
  const statDiv = document.querySelectorAll(".stat");
  const button = document.getElementById("share-button");

  const played = state.won || state.gameOver;

  const text = state.won ? "Parabéns!" : played ? "Que pena!": "";
  modalHeader.innerHTML = `${played ? text + "<br/>" : ""}<span>${played ? "Volte amanhã para um novo versículo." : "Todo dia um novo versículo!"}</span>`;

  const statsToShow = [
    { stat: stats.games, title: "Total de jogos" },
    {
      stat: `${percentage.toFixed(1).replace(".0", "")}%`,
      title: "Porcentagem de vitórias",
    },
    { stat: stats.winStreak, title: "Sequência atual" },
    { stat: stats.maxStreak, title: "Sequência máxima" },
  ];

  for (let i = 0; i < statDiv.length; i += 1) {
    statDiv[i].childNodes[1].textContent = statsToShow[i].stat;
    statDiv[i].childNodes[3].textContent = statsToShow[i].title;
  }

  button.onclick = () => createShareContent();

  if (!played) {
    button.classList.add("hidden");
  } else {
      button.classList.remove("hidden");
  }

  disableEnter();

  modal.classList.remove("hidden");
}

function disableEnter() {
  const enter = document.getElementById("Enter");
  enter.setAttribute("disabled", "true");
}

function hideStatsModal(e) {
  const modal = document.getElementById("modal");

  document.addEventListener("click", (e) => {
    if (e.target.id === "modal") {
      modal.classList.add("hidden");
    }
  });
}

function hideSettingsModal() {
  const settingsModal = document.getElementById("settings-modal");

  document.addEventListener("click", (e) => {
    if (e.target.id === "settings-modal") {
      settingsModal.classList.add("hidden");
    }
  });
}

function showHelpModal() {
  const modal = document.getElementById("help-modal");
  modal.classList.remove("hidden");
}

function hideHelpModal() {
  const modal = document.getElementById("help-modal");
  modal.classList.add("hidden");
}

function showSettingsModal() {
  const modal = document.getElementById("settings-modal");
  modal.classList.remove("hidden");
}

function showInfoModal() {
  const modal = document.getElementById("info-modal");
  modal.classList.remove("hidden");
}

function hideInfoModal() {
  const modal = document.getElementById("info-modal");
  modal.classList.add("hidden");
}

function getUserDate() {
  const currentDate = new Date();
  const timezoneOffset = currentDate.getTimezoneOffset();
  const offsetMilliseconds = timezoneOffset * 60 * 1000;
  return new Date(currentDate.getTime() - offsetMilliseconds);
}

function getDateOne() {
  const currentDate = new Date("2024-04-26");
  currentDate.setUTCHours(0, 0, 0, 0);
  return currentDate;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

startUp();
