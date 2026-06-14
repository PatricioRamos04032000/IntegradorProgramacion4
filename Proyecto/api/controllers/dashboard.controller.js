import DashboardService from '../services/dashboard.service.js';

export default class DashboardController {
  constructor() {
    this.service = new DashboardService();
  }

  getDashboard = async (req, res) => {
    const limit = req.query.limit ?? 10;
    const offset = req.query.offset ?? 0;
    const data = await this.service.getDashboard({ limit, offset });
    res.json(data);
  };
}
