function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${name} is missing, using fallback`);
    return '';
  }
  return value || defaultValue!;
}

let _config: any = null;

export const config = new Proxy({}, {
  get(target, prop) {
    if (!_config) {
      _config = {
        supabase: {
          url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
          anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
          serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),
        },
        app: {
          environment: getEnvVar('NODE_ENV', 'development'),
          logLevel: getEnvVar('LOG_LEVEL', 'info'),
          demoEnabled: getEnvVar('NEXT_PUBLIC_DEMO_ENABLED', 'false') === 'true',
        },
        features: {
          multiCurrency: getEnvVar('NEXT_PUBLIC_FEATURE_MULTI_CURRENCY', 'true') === 'true',
          advancedReports: getEnvVar('NEXT_PUBLIC_FEATURE_ADVANCED_REPORTS', 'true') === 'true',
          realTimeSync: getEnvVar('NEXT_PUBLIC_FEATURE_REALTIME_SYNC', 'false') === 'true',
        }
      };
    }
    return _config[prop];
  }
}) as {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  app: {
    environment: string;
    logLevel: string;
    demoEnabled: boolean;
  };
  features: {
    multiCurrency: boolean;
    advancedReports: boolean;
    realTimeSync: boolean;
  };
};