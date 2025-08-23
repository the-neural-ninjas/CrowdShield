import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Clock, Activity } from "lucide-react";

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error' | 'loading' | 'normal' | 'critical';
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showText?: boolean;
  text?: string;
  animated?: boolean;
}

export function StatusIndicator({ 
  status, 
  size = "md", 
  showIcon = true, 
  showText = false, 
  text,
  animated = true 
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
      case 'normal':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-600',
          icon: CheckCircle,
          text: text || 'Online'
        };
      case 'warning':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          icon: AlertTriangle,
          text: text || 'Warning'
        };
      case 'critical':
      case 'error':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-600',
          icon: XCircle,
          text: text || 'Critical'
        };
      case 'loading':
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          icon: Clock,
          text: text || 'Loading'
        };
      case 'offline':
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          icon: XCircle,
          text: text || 'Offline'
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          icon: Activity,
          text: text || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} ${config.color} rounded-full`}
          animate={animated && status === 'critical' ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          } : animated && status === 'warning' ? {
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1]
          } : {}}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {animated && status === 'loading' && (
          <motion.div
            className={`${sizeClasses[size]} ${config.color} rounded-full absolute inset-0`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </div>
      
      {showIcon && (
        <IconComponent className={`${iconSizes[size]} ${config.textColor}`} />
      )}
      
      {showText && (
        <span className={`${textSizes[size]} ${config.textColor} font-medium`}>
          {config.text}
        </span>
      )}
    </div>
  );
}

export function AnimatedStatusCard({ 
  status, 
  title, 
  description, 
  value,
  trend 
}: {
  status: 'online' | 'offline' | 'warning' | 'error' | 'loading' | 'normal' | 'critical';
  title: string;
  description?: string;
  value?: string | number;
  trend?: 'up' | 'down' | 'stable';
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'normal':
        return 'border-green-500/30 bg-green-50/50';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-50/50';
      case 'critical':
      case 'error':
        return 'border-red-500/30 bg-red-50/50';
      case 'loading':
        return 'border-blue-500/30 bg-blue-50/50';
      default:
        return 'border-gray-500/30 bg-gray-50/50';
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return (
          <motion.div
            className="text-green-600"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ↗
          </motion.div>
        );
      case 'down':
        return (
          <motion.div
            className="text-red-600"
            animate={{ y: [0, 2, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ↘
          </motion.div>
        );
      default:
        return <span className="text-gray-600">→</span>;
    }
  };

  return (
    <motion.div
      className={`p-4 rounded-lg border-2 ${getStatusColor(status)} crowdshield-card`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-2">
        <StatusIndicator status={status} size="md" showText={false} />
        {trend && getTrendIcon(trend)}
      </div>
      
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      
      {description && (
        <p className="text-sm text-gray-600 mb-2">{description}</p>
      )}
      
      {value && (
        <div className="text-2xl font-bold text-gradient-primary">
          {value}
        </div>
      )}
    </motion.div>
  );
}

export function PulseIndicator({ 
  status, 
  size = "md" 
}: StatusIndicatorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'normal':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
      case 'error':
        return 'bg-red-500';
      case 'loading':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      <motion.div
        className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} ${getStatusColor(status)} rounded-full`}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} ${getStatusColor(status)} rounded-full absolute inset-0`}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.7, 0, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.5
        }}
      />
    </div>
  );
} 