/// <reference path="./types/index.d.ts" />

import { UserInfo } from '../miniprogram/utils/types';

interface IAppOption {
  globalData: {
    userInfo: UserInfo | null;
    token: string | null;
    systemInfo: WechatMiniprogram.SystemInfo | null;
  };
  checkLogin: () => Promise<boolean>;
  getUserInfo: () => Promise<UserInfo | null>;
  login: () => Promise<void>;
  logout: () => void;
  getSystemInfo: () => void;
  checkARSupport: () => void;
  initCloud: () => void;
}
