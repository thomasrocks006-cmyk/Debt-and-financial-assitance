interface AlertBannerProps {
  type: "info" | "warning" | "error" | "success";
  title?: string;
  message: string;
}

const styles = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  error: "bg-red-50 border-red-200 text-red-800",
  success: "bg-green-50 border-green-200 text-green-800",
};

const icons = {
  info: "ℹ️",
  warning: "⚠️",
  error: "🚨",
  success: "✅",
};

export function AlertBanner({ type, title, message }: AlertBannerProps) {
  return (
    <div className={`border rounded-lg p-4 flex items-start gap-3 ${styles[type]}`}>
      <span className="text-xl flex-shrink-0">{icons[type]}</span>
      <div>
        {title && <div className="font-medium mb-0.5">{title}</div>}
        <div className="text-sm">{message}</div>
      </div>
    </div>
  );
}
