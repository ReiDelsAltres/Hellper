var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ReIcon_1;
import { Component, ReComponent } from "@Purper";
/**
 * ReIcon — универсальный компонент иконки в стиле ReButton/ReChip
 * Содержит встроенную библиотеку Material Design иконок
 *
 * Атрибуты:
 * - icon: имя иконки из библиотеки
 * - size: xs | sm | md | lg | xl | xxl
 * - color: primary | secondary | tertiary | additional | success | warning | error | info | text | text-secondary | empty
 * - variant: (default) | contrast | outlined
 * - interactive: добавляет hover эффекты
 * - spin: анимация вращения
 * - pulse: анимация пульсации
 * - disabled: отключённое состояние
 * - rotate: 90 | 180 | 270
 * - flip: horizontal | vertical | both
 * - badge: текст или пустая строка для точки
 */
let ReIcon = class ReIcon extends Component {
    static { ReIcon_1 = this; }
    iconWrapper;
    svgElement;
    /**
     * Библиотека предустановленных иконок Material Design
     */
    static iconLibrary = new Map([
        ['home', { name: 'home', path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' }],
        ['user', { name: 'user', path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' }],
        ['settings', {
                name: 'settings',
                path: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z'
            }],
        ['copy', { name: 'copy', path: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z' }],
        ['menu', { name: 'menu', path: 'M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z' }],
        ['close', { name: 'close', path: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' }],
        ['arrow-left', { name: 'arrow-left', path: 'M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z' }],
        ['arrow-right', { name: 'arrow-right', path: 'M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z' }],
        ['arrow-up', { name: 'arrow-up', path: 'M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z' }],
        ['arrow-down', { name: 'arrow-down', path: 'M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z' }],
        ['search', { name: 'search', path: 'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' }],
        ['heart', { name: 'heart', path: 'M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5 2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z' }],
        ['star', { name: 'star', path: 'M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z' }],
        ['palette', {
                name: 'palette',
                path: 'M8.649 2.577A10.004 10.004 0 0 1 20.344 6.49a9.995 9.995 0 0 1 1.2 8.486l-.004.01-.005.015a2.958 2.958 0 0 1-2.836 2.001h-2.69a1.037 1.037 0 0 0-.95.68c-.047.13-.068.27-.06.409v.916A3.01 3.01 0 0 1 11.96 22a9.626 9.626 0 0 1-4.195-1l.009.005-.018-.009.01.004a10.1 10.1 0 0 1-5.716-7.996l-.001-.012a9.992 9.992 0 0 1 6.6-10.415Zm3.35 3.429a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12ZM8.53 7.518a1 1 0 0 0 0 2h.01a1 1 0 1 0 0-2h-.01Zm6.968 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM6.99 11.004a1 1 0 1 0 0 2H7a1 1 0 1 0 0-2h-.01Z'
            }],
        ['info', { name: 'info', path: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,8.5A1.5,1.5 0 0,1 12.5,7A1.5,1.5 0 0,1 14,8.5A1.5,1.5 0 0,1 12.5,10A1.5,1.5 0 0,1 11,8.5M10.5,12H13.5V17H10.5V12Z' }],
        ['warning', { name: 'warning', path: 'M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16' }],
        ['error', { name: 'error', path: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M14.5,9A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 13,10.5A1.5,1.5 0 0,1 14.5,9M10,17L14,13L10,9V17Z' }],
        ['success', { name: 'success', path: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z' }],
        ['check', { name: 'check', path: 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z' }],
        ['add', { name: 'add', path: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z' }],
        ['remove', { name: 'remove', path: 'M19,13H5V11H19V13Z' }],
        ['edit', { name: 'edit', path: 'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z' }],
        ['delete', { name: 'delete', path: 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z' }],
        ['download', { name: 'download', path: 'M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z' }],
        ['upload', { name: 'upload', path: 'M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z' }],
        ['filter', { name: 'filter', path: 'M6,13H18V11H6M3,6V8H21V6M10,18H14V16H10V18Z' }],
        ['filter_list', { name: 'filter_list', path: 'M10,18H14V16H10M3,6V8H21V6M6,13H18V11H6' }],
        ['sort', { name: 'sort', path: 'M3,13H15V11H3M3,6V8H21V6M3,18H9V16H3V18Z' }],
        ['refresh', { name: 'refresh', path: 'M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z' }],
        ['visibility', { name: 'visibility', path: 'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z' }],
        ['visibility_off', { name: 'visibility_off', path: 'M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z' }],
        ['lock', { name: 'lock', path: 'M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z' }],
        ['lock_open', { name: 'lock_open', path: 'M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z' }],
        ['favorite', { name: 'favorite', path: 'M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z' }],
        ['favorite_border', { name: 'favorite_border', path: 'M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z' }],
        ['notifications', { name: 'notifications', path: 'M12,22A2,2 0 0,0 14,20H10A2,2 0 0,0 12,22M18,16V11C18,7.93 16.36,5.36 13.5,4.68V4A1.5,1.5 0 0,0 12,2.5A1.5,1.5 0 0,0 10.5,4V4.68C7.63,5.36 6,7.92 6,11V16L4,18V19H20V18L18,16Z' }],
        ['account_circle', { name: 'account_circle', path: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z' }],
        ['chess-king', {
                name: 'chess-king',
                path: 'M11 2h2v2h2v1.5h-2V7l2.4 2.4v1.3l-1.6 1.6 1.2 3.2H18v2H6v-2h1.8l1.2-3.2-1.6-1.6V9.4L11 7V5.5H9V4h2zM8.9 16l-0.7 2h7.6l-0.7-2z'
            }],
        ['chess-queen', {
                name: 'chess-queen',
                path: 'M9 2l1.2 2.4L12 2l1.8 2.4L15 2l2 3-1.8 4L18 12v1.5h-3.1L16.5 18H7.5l1.6-4.5H6V12l2.8-3L7 5l2-3zM9.2 16l-0.7 2h6.9l-0.7-2z'
            }],
        ['chess-knight', {
                name: 'chess-knight',
                path: 'M16.5 5.5l-3-1.5-5 4.5V12h2v3H9l-1 3v2h10v-2h-2v-4l1.6-1.6c0.6-0.6 0.6-1.6 0-2.2L14 8.8l2.5-2.5zM11 10.5L13 8v2.5z'
            }],
        ['chess-rook', {
                name: 'chess-rook',
                path: 'M6 4h3V6h2V4h2v2h2V4h3v4h-2v10h1.5v3h-13v-3H8V8H6z'
            }],
        ['chess-board', {
                name: 'chess-board',
                path: 'M6 6h5v5H6zM13 6h5v5h-5zM6 13h5v5H6zM13 13h5v5h-5z'
            }],
        ['email', { name: 'email', path: 'M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z' }],
        ['phone', { name: 'phone', path: 'M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z' }],
        ['share', { name: 'share', path: 'M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z' }],
        ['link', { name: 'link', path: 'M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z' }],
        ['more_vert', { name: 'more_vert', path: 'M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z' }],
        ['more_horiz', { name: 'more_horiz', path: 'M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z' }]
    ]);
    static get observedAttributes() {
        return [
            'icon', 'size', 'color', 'variant',
            'interactive', 'spin', 'pulse', 'disabled',
            'rotate', 'flip', 'badge'
        ];
    }
    preLoad(holder) {
        this.iconWrapper = holder.element.querySelector('.icon-wrapper');
        this.updateIcon();
        this.onAttributeChangedCallback((name, oldValue, newValue) => {
            // icon change requires regenerating SVG path
            if (name === 'icon') {
                this.updateIcon();
                return;
            }
            // other attribute changes affect visual representation / classes
            if ([
                'size', 'color', 'variant', 'interactive', 'spin', 'pulse', 'disabled', 'rotate', 'flip', 'badge'
            ].includes(name)) {
                this.updateVisuals();
            }
        });
        return Promise.resolve();
    }
    /**
     * Создаёт или обновляет SVG элемент с иконкой
     */
    updateIcon() {
        const iconName = this.getAttribute('icon');
        if (!iconName) {
            // Если icon не задан, оставляем слот для ручного контента
            if (this.svgElement) {
                this.svgElement.remove();
                this.svgElement = undefined;
            }
            return;
        }
        const iconConfig = ReIcon_1.iconLibrary.get(iconName);
        if (!iconConfig) {
            console.warn(`[ReIcon] Icon "${iconName}" not found in library`);
            return;
        }
        // Создаём или обновляем SVG элемент
        if (!this.svgElement && this.iconWrapper) {
            this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svgElement.classList.add('re-icon-svg');
            this.svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            this.iconWrapper.appendChild(this.svgElement);
        }
        if (this.svgElement) {
            // Устанавливаем viewBox
            const viewBox = iconConfig.viewBox || '0 0 24 24';
            this.svgElement.setAttribute('viewBox', viewBox);
            // Создаём path элемент
            const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathElement.setAttribute('d', iconConfig.path);
            // Очищаем старое содержимое и добавляем новый path
            this.svgElement.innerHTML = '';
            this.svgElement.appendChild(pathElement);
            // Ensure visuals match current attributes after (re)creating svg
            this.updateVisuals();
        }
    }
    /**
     * Apply visual attributes (size, color, variant, spin, pulse, rotate, flip, badge)
     */
    updateVisuals() {
        // apply size classes
        const size = this.getAttribute('size') || '';
        this.iconWrapper?.querySelectorAll('.re-icon-svg').forEach(svg => {
            svg.classList.remove('size-xs', 'size-sm', 'size-md', 'size-lg', 'size-xl', 'size-xxl');
            if (size)
                svg.classList.add(`size-${size}`);
        });
        // apply spin/pulse/interactive/disabled classes
        const spin = this.hasAttribute('spin');
        const pulse = this.hasAttribute('pulse');
        const interactive = this.hasAttribute('interactive');
        const disabled = this.hasAttribute('disabled');
        if (this.svgElement) {
            this.svgElement.classList.toggle('spin', spin);
            this.svgElement.classList.toggle('pulse', pulse);
            this.svgElement.classList.toggle('interactive', interactive);
            this.svgElement.classList.toggle('disabled', disabled);
        }
        // rotation / flip transforms
        if (this.svgElement) {
            const rotate = this.getAttribute('rotate');
            const flip = this.getAttribute('flip');
            let transformParts = [];
            if (rotate)
                transformParts.push(`rotate(${rotate}deg)`);
            if (flip === 'horizontal' || flip === 'both')
                transformParts.push('scaleX(-1)');
            if (flip === 'vertical' || flip === 'both')
                transformParts.push('scaleY(-1)');
            this.svgElement.style.transform = transformParts.join(' ');
        }
        // badge: show or hide simple badge element on wrapper
        const badgeVal = this.getAttribute('badge');
        let badgeEl = this.iconWrapper?.querySelector('.re-icon-badge');
        if (badgeVal != null && badgeVal !== '') {
            if (!badgeEl && this.iconWrapper) {
                badgeEl = document.createElement('span');
                badgeEl.className = 're-icon-badge';
                this.iconWrapper.appendChild(badgeEl);
            }
            if (badgeEl)
                badgeEl.textContent = badgeVal;
        }
        else if (badgeVal === '') {
            // empty string badge => dot indicator
            if (!badgeEl && this.iconWrapper) {
                badgeEl = document.createElement('span');
                badgeEl.className = 're-icon-badge';
                this.iconWrapper.appendChild(badgeEl);
            }
            if (badgeEl)
                badgeEl.textContent = '';
        }
        else {
            if (badgeEl)
                badgeEl.remove();
        }
    }
    /**
     * Получить список всех доступных иконок
     */
    static getAvailableIcons() {
        return Array.from(ReIcon_1.iconLibrary.keys());
    }
    /**
     * Проверить, существует ли иконка в библиотеке
     */
    static hasIcon(name) {
        return ReIcon_1.iconLibrary.has(name);
    }
    // Публичные методы
    /**
     * Установить иконку
     */
    setIcon(name) {
        if (name) {
            this.setAttribute('icon', name);
        }
        else {
            this.removeAttribute('icon');
        }
    }
    /**
     * Установить размер
     */
    setSize(size) {
        this.setAttribute('size', size);
    }
    /**
     * Установить цвет
     */
    setColor(color) {
        this.setAttribute('color', color);
    }
    /**
     * Установить вариант
     */
    setVariant(variant) {
        if (variant) {
            this.setAttribute('variant', variant);
        }
        else {
            this.removeAttribute('variant');
        }
    }
    /**
     * Включить/выключить вращение
     */
    setSpin(enabled) {
        this.toggleAttribute('spin', enabled);
    }
    /**
     * Включить/выключить пульсацию
     */
    setPulse(enabled) {
        this.toggleAttribute('pulse', enabled);
    }
    /**
     * Отключить/включить иконку
     */
    setDisabled(disabled) {
        this.toggleAttribute('disabled', disabled);
    }
    /**
     * Установить бейдж
     */
    setBadge(value) {
        if (value !== null) {
            this.setAttribute('badge', value);
        }
        else {
            this.removeAttribute('badge');
        }
    }
};
ReIcon = ReIcon_1 = __decorate([
    ReComponent({
        markupURL: "./src/components/ReIcon.html",
        cssURL: "./src/components/ReIcon.html.css",
        jsURL: "./src/components/ReIcon.html.js",
        class: ReIcon,
    }, "re-icon")
], ReIcon);
export default ReIcon;
//# sourceMappingURL=ReIcon.html.js.map