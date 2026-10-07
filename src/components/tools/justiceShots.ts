/* ------------------------------------------------------------------ *
 * The camera destinations around the Justice model.                  *
 * Model space: 1.9 units tall, centred on 0, the statue faces +z.     *
 * The scales hang on her right (−x), the sword on her left (+x).      *
 * ------------------------------------------------------------------ */

export type ShotId = 'face' | 'law' | 'about' | 'contact';

export interface Shot {
  /** camera position */
  pos: [number, number, number];
  /** what the camera looks at and focuses on */
  target: [number, number, number];
  fov: number;
  /** horizontal composition: where the target sits on screen, −1 left … 1 right (desktop) */
  frame: number;
  /** depth-of-field strength */
  aperture: number;
  /** the 3D point the text panel is pinned to, and which side of it the panel sits */
  anchor: [number, number, number];
  side: 'left' | 'right';
  /** portrait screens: camera pulled back a little and the subject raised */
  mobile: { pos: [number, number, number]; target: [number, number, number]; fov: number };
}

export const ORDER: ShotId[] = ['face', 'law', 'about', 'contact'];

export const SHOTS: Record<ShotId, Shot> = {
  face: {
    pos: [0.14, 0.7, 0.7],
    target: [0.02, 0.655, 0.06],
    fov: 26,
    frame: 0.24,
    aperture: 0.012,
    anchor: [-0.09, 0.66, 0.08],
    side: 'left',
    mobile: { pos: [0.13, 0.64, 0.98], target: [0.02, 0.6, 0.06], fov: 34 },
  },
  law: {
    pos: [-0.92, 0.5, 1.2],
    target: [-0.3, 0.3, 0.12],
    fov: 32,
    frame: 0.3,
    aperture: 0.009,
    anchor: [-0.52, 0.34, 0.14],
    side: 'left',
    mobile: { pos: [-1.05, 0.46, 1.75], target: [-0.3, 0.22, 0.12], fov: 40 },
  },
  about: {
    pos: [1.6, 0.34, 3.75],
    target: [0.02, -0.06, 0.0],
    fov: 34,
    frame: 0.32,
    aperture: 0.002,
    anchor: [-0.5, 0.15, 0.0],
    side: 'left',
    mobile: { pos: [1.4, 0.2, 4.4], target: [0.0, -0.3, 0.0], fov: 38 },
  },
  contact: {
    pos: [1.05, -0.18, 0.92],
    target: [0.22, -0.4, 0.2],
    fov: 30,
    frame: 0.3,
    aperture: 0.011,
    anchor: [0.0, -0.3, 0.2],
    side: 'left',
    mobile: { pos: [1.2, -0.1, 1.4], target: [0.2, -0.5, 0.2], fov: 38 },
  },
};
