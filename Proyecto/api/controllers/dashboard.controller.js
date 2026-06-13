import DashboardService from '../services/dashboard.service.js';

export default class DashboardController {
  constructor() {
    this.service = new DashboardService();
  }

  getDashboard = async (req, res) => {
    const data = await this.service.getDashboard();
    res.json(data);
  };
}
