// Plan limits for different subscription tiers
const PLAN_LIMITS = {
    FREE: {
        shops: 1,
        customers: 10,
        suppliers: 10
    },
    BASIC: {
        shops: 3,
        customers: 50,
        suppliers: 50
    },
    PRO: {
        shops: Infinity,
        customers: Infinity,
        suppliers: Infinity
    }
};


const canAddEntity = (plan, entityType, currentCount) => {
    const limit = PLAN_LIMITS[plan]?.[entityType];
    
    if (!limit) {
        return {
            allowed: false,
            limit: 0,
            message: 'Invalid plan or entity type'
        };
    }

    const allowed = currentCount < limit;
    
    return {
        allowed,
        limit,
        message: allowed 
            ? 'You can add more entities' 
            : `You have reached the ${entityType} limit (${limit}) for the ${plan} plan. Please upgrade to add more.`
    };
};


const getUpgradeMessage = (entityType, currentPlan) => {
    const entityName = entityType.slice(0, -1); 
    
    if (currentPlan === 'FREE') {
        return `You have reached your ${entityName} limit on the Free plan. Upgrade to Basic (${PLAN_LIMITS.BASIC[entityType]} ${entityType}) or Pro (unlimited) to add more.`;
    } else if (currentPlan === 'BASIC') {
        return `You have reached your ${entityName} limit on the Basic plan. Upgrade to Pro for unlimited ${entityType}.`;
    }
    
    return `You have reached your ${entityName} limit.`;
};

module.exports = {
    PLAN_LIMITS,
    canAddEntity,
    getUpgradeMessage
};
