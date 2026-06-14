import AuthService from '../services/auth.service.js';
import { setRefreshCookie, clearRefreshCookie } from '../utils/authCookies.js';

export default class AuthController {
  constructor() {
    this.service = new AuthService();
  }

  login = async (req, res) => {
    const { nombreUsuario, contrasenia } = req.body || {};
    const result = await this.service.login(nombreUsuario, contrasenia);
    setRefreshCookie(res, result.refreshToken);
    res.json({ accessToken: result.accessToken, user: result.user });
  };

  refresh = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    const result = await this.service.refresh(refreshToken);
    setRefreshCookie(res, result.refreshToken);
    res.json({ accessToken: result.accessToken, user: result.user });
  };

  logout = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    await this.service.logout(refreshToken);
    clearRefreshCookie(res);
    res.status(204).send();
  };

  me = async (req, res) => {
    res.json(req.user);
  };
}
