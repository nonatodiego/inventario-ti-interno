import { Router } from "express";

export const dashboardRouter = Router();

dashboardRouter.get("/metrics", (_request, response) => {
  response.json({
    data: {
      collaborators: 42,
      equipmentTotal: 118,
      equipmentAssigned: 86,
      equipmentAvailable: 24,
      resourcesAvailable: 12,
      pendingTerms: 5
    }
  });
});
