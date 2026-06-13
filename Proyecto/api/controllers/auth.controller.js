import AuthService from '../services/auth.service.js';

export default class AuthController {
  constructor() {
    this.service = new AuthService();
  }

  login = async (req, res) => {
    const { nombreUsuario, contrasenia } = req.body || {};
    const result = await this.service.login(nombreUsuario, contrasenia);
    res.json(result);
  };
}
