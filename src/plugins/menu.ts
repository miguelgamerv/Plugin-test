/**
 * YouTube Music Kawarp Plugin - Menu de Configurações
 * Define as opções de configuração do plugin na UI
 */

import { createMenu } from '@/utils';

export const menu = createMenu([
  {
    label: t('plugins.kawarp.menu.warpIntensity.label'),
    submenu: [
      {
        label: t('plugins.kawarp.menu.warpIntensity.submenu.low'),
        type: 'radio',
        checked: false,
        click() {
          setConfig({ warpIntensity: 0.3 });
        },
      },
      {
        label: t('plugins.kawarp.menu.warpIntensity.submenu.medium'),
        type: 'radio',
        checked: true,
        click() {
          setConfig({ warpIntensity: 0.6 });
        },
      },
      {
        label: t('plugins.kawarp.menu.warpIntensity.submenu.high'),
        type: 'radio',
        checked: false,
        click() {
          setConfig({ warpIntensity: 0.9 });
        },
      },
    ],
  },
  {
    label: t('plugins.kawarp.menu.blurPasses.label'),
    submenu: [
      {
        label: t('plugins.kawarp.menu.blurPasses.submenu.low'),
        type: 'radio',
        checked: false,
        click() {
          setConfig({ blurPasses: 4 });
        },
      },
      {
        label: t('plugins.kawarp.menu.blurPasses.submenu.medium'),
        type: 'radio',
        checked: true,
        click() {
          setConfig({ blurPasses: 8 });
        },
      },
      {
        label: t('plugins.kawarp.menu.blurPasses.submenu.high'),
        type: 'radio',
        checked: false,
        click() {
          setConfig({ blurPasses: 16 });
        },
      },
    ],
  },
  {
    label: t('plugins.kawarp.menu.animationSpeed.label'),
    submenu: [
      {
        label: t('plugins.kawarp.menu.animationSpeed.submenu.slow'),
        type: 'radio',
        checked: false,
        click() {
          setConfig({ animationSpeed: 0.5 });
        },
      },
      {
        label: t('plugins.kawarp.menu.animationSpeed.submenu.normal'),
        type: 'radio',
        checked: true,
        click() {
          setConfig({ animationSpeed: 1.0 });
        },
      },
      {
        label: t('plugins.kawarp.menu.animationSpeed.submenu.fast'),
        type: 'radio',
        checked: false,
        click() {
          setConfig({ animationSpeed: 1.5 });
        },
      },
    ],
  },
  {
    label: t('plugins.kawarp.menu.transitionDuration.label'),
    submenu: [
      {
        label: t('plugins.kawarp.menu.transitionDuration.submenu.fast'),
        type: 'radio',
        checked: false,
        click() {
          setConfig({ transitionDuration: 300 });
        },
      },
      {
        label: t('plugins.kawarp.menu.transitionDuration.submenu.normal'),
        type: 'radio',
        checked: true,
        click() {
          setConfig({ transitionDuration: 800 });
        },
      },
      {
        label: t('plugins.kawarp.menu.transitionDuration.submenu.slow'),
        type: 'radio',
        checked: false,
        click() {
          setConfig({ transitionDuration: 1500 });
        },
      },
    ],
  },
]);
