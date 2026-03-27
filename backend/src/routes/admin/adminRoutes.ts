import { Router } from "express";
import { authenticate, authorizeRole } from "../../middleware/auth";

import { customersRouter } from "./customers";
import { analyticsRouter } from "./analytics";
import { interventionsRouter } from "./interventions";
import { entanglementsRouter } from "./entanglements";
import { communicationsRouter } from "./communications";
import { snapshotsRouter } from "./snapshots";

export const adminRouter = Router();

adminRouter.use(authenticate, authorizeRole(["ADMIN"]));

// Mount existing functionality under the admin namespace
// Wait, the UI routes want /api/admin/dashboard, /api/admin/portfolio etc. 
// We will alias or just let the frontend know where to call.
adminRouter.use("/customers", customersRouter); // Contains /api/admin/customers/:id
adminRouter.use("/analytics", analyticsRouter);
adminRouter.use("/interventions", interventionsRouter);
adminRouter.use("/entanglements", entanglementsRouter);
adminRouter.use("/communications", communicationsRouter);
adminRouter.use("/snapshots", snapshotsRouter);

// Specific aliases if the exact exact URL was insisted upon
// GET /api/admin/dashboard maps to analytics summary?
adminRouter.use("/dashboard", analyticsRouter); 
adminRouter.use("/portfolio", analyticsRouter); 
