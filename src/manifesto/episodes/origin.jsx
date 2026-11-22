/* Pagaia-Man #1. Each panel lists its artwork, a scene description for readers who
   cannot see the drawing, captions and dialogue in reading order. The same data feeds
   the comic and the text version, so the wording stays identical in both.

   Geometry uses the artwork's viewBox units: `box` places a caption exactly where the
   original drawing had it, and `size` is the original font size in those units.
   Bubble positions are percentages of the panel, as in the original layout. */

import {
  Panel1Art, Panel2Art, Panel3Art, Panel4Art, Panel5Art,
  Panel6Art, Panel7Art, Panel8Art, Panel9Art, Panel10Art,
} from '../art.jsx'

const DEV = 'The developer'
const HERO = 'Pagaia-Man'

export const origin = {
  id: 'origin',
  number: 1,
  title: 'The Paddle That Changed Everything',
  panels: [
    {
      art: Panel1Art, width: 560, height: 300, wide: true,
      scene: 'Night at a cluttered desk. Three monitors show an ERROR 500 page, a failing build log and a 404 page. A tired developer in glasses sits beside a cold coffee and a tipped-over cup.',
      captions: [{ text: 'Codestan. Sector 7G. 3:47 AM. The web is broken.', box: [10, 10, 540, 28], size: 12.5, background: '#f5e642', color: '#000' }],
      dialogue: [{ speaker: DEV, kind: 'speech', tail: 'down-left', place: { top: '15%', right: '4%', width: '30%' },
        lines: ['*sigh*... another 500 error.', 'The web is a total disaster.'] }],
    },
    {
      art: Panel2Art, width: 260, height: 280,
      scene: 'A flash of yellow light. The developer stands wide-eyed while a light bulb appears above him. Sound effect: ZAP!',
      captions: [{ text: 'Then... a vision!', box: [8, 8, 244, 24], size: 12, background: '#000', color: '#f5e642' }],
      dialogue: [{ speaker: DEV, kind: 'thought', place: { top: '30%', right: '3%', width: '45%' },
        lines: ['What if... I could build', <>something that <em>ACTUALLY</em> works?</>] }],
    },
    {
      art: Panel3Art, width: 260, height: 280,
      scene: 'In a rush of red and blue wind the developer becomes a caped hero with a paddle emblem on his chest, one fist raised. Sound effect: WHOOOOSH!',
      captions: [{ text: 'The transformation!', box: [8, 8, 244, 24], size: 13, background: '#e63946', color: '#fff' }],
      dialogue: [{ speaker: HERO, kind: 'speech', tail: 'down-right', place: { top: '33%', left: '4%', width: '40%' },
        lines: ["They said it couldn't be done...", 'but I shall build...', <strong>PAGAIA!</strong>] }],
    },
    {
      art: Panel4Art, width: 560, height: 300, wide: true,
      scene: 'The hero types at a desk with three monitors: code defining pagaia.xyz, a core engine that turns chaos into order with a successful build, and a loading bar at 78%. A pizza box waits on the desk. Sound effects: CLACK! TAK TAK!',
      captions: [{ text: 'The mission begins. Days blur into nights.', box: [8, 8, 544, 24], size: 13, background: '#f5e642', color: '#000' }],
      dialogue: [],
    },
    {
      art: Panel5Art, width: 260, height: 280,
      scene: 'Two bug monsters labeled NULL PTR and SEGFAULT attack. The hero charges at them. Sound effect: CRASH!',
      captions: [{ text: 'But the bugs fight back!', box: [8, 8, 244, 24], size: 11, background: '#e63946', color: '#fff' }],
      dialogue: [{ speaker: HERO, kind: 'speech', tail: 'left', place: { right: '4%', bottom: '31%', width: '44%' },
        lines: ['SEGFAULT?!', 'NULL POINTER?!', <strong>COME AT ME!!</strong>] }],
    },
    {
      art: Panel6Art, width: 560, height: 300, wide: true,
      scene: 'The hero points at a giant glowing paddle. A monitor shows pagaia.xyz: build successful, tests passed, ready to deploy, press ENTER to launch. Sound effect: EUREKA!',
      captions: [{ text: "A paddle — to navigate the digital ocean! That's it!", box: [8, 8, 544, 26], size: 13, background: '#2dc653', color: '#000' }],
      dialogue: [{ speaker: HERO, kind: 'speech', tail: 'down-left', place: { top: '13%', left: '24%', width: '24%' },
        lines: ['A paddle! For when the', 'waters get rough...', <strong>PAGAIA.XYZ!</strong>] }],
    },
    {
      art: Panel7Art, width: 260, height: 280,
      scene: 'Close-up of a finger hovering over a red ENTER key. Sound effect: DEPLOY!',
      captions: [{ text: 'The moment of truth...', box: [8, 8, 244, 24], size: 11, background: '#000', color: '#f5e642' }],
      dialogue: [{ speaker: HERO, kind: 'speech', tail: 'up', place: { left: '4%', bottom: '16%', width: '52%' },
        lines: ['For the people...', 'for the world...', <strong>I DEPLOY!!</strong>] }],
    },
    {
      art: Panel8Art, width: 560, height: 300, wide: true,
      scene: 'A globe with the paddle logo at its center, linked to points across every continent, while cheering people surround it. Sound effects: WOW! AMAZING!',
      captions: [{ text: 'And across the globe... pagaia.xyz is live!', box: [8, 8, 544, 26], size: 13, background: '#4a9eff', color: '#000' }],
      dialogue: [],
    },
    {
      art: Panel9Art, width: 260, height: 280,
      scene: 'The developer is asleep on the desk, glasses askew. A smug cat sits on the keyboard. The monitor shows "pagaia.js saved!" followed by rows of random letters, "847 lines deleted" and a commit with the message ".".',
      captions: [
        { text: 'Meanwhile, in reality...', box: [8, 8, 244, 24], size: 11, background: '#000', color: '#f5e642' },
        { text: '*tap tap tap tap tap tap*', box: [8, 250, 244, 22], size: 9.5, background: '#f5e642', color: '#000', after: true },
      ],
      dialogue: [],
    },
    {
      art: Panel10Art, width: 560, height: 300, wide: true,
      scene: 'A window onto a starry sky and a crescent moon. The developer stands looking out, a cat sitting beside him on the sill.',
      captions: [{ text: "Dawn. The cat purrs. The stars don't care about uptime.", box: [8, 8, 544, 24], size: 12, background: '#000', color: '#f5e642' }],
      dialogue: [{ speaker: DEV, kind: 'thought', place: { top: '12%', left: '74.5%', width: '24%' },
        lines: ['maybe... the most', 'beautiful code runs', 'on fusion and gravity', 'and cats.'] }],
    },
  ],
}

export const episodes = [origin]
