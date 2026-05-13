const authService = require('../services/authService');

const authController = {
  login: async (req, res, next) => {
    try {
      const { nombre_usuario, contrasenia } = req.body || {};
      const result = await authService.login(nombre_usuario, contrasenia);
      res.json(result);
    } catch (error) {
      if (error.status && error.status >= 400 && error.status < 500) {
        return res.status(error.status).json({ error: error.message });
      }
      next(error);
    }
  },
};

module.exports = authController;
