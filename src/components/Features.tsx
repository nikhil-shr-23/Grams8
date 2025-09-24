import { Infinity as InfinityIcon, ShieldCheck, WifiOff, Zap, Database, Code } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: <WifiOff className="h-6 w-6 text-blue-500" />,
      title: "Offline First",
      description: "Work on your diagrams anytime, anywhere, with or without an internet connection.",
    },
    {
      icon: <InfinityIcon className="h-6 w-6 text-green-500" />,
      title: "No Limits",
      description: "Create and manage as many diagrams as you need, with no restrictions.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-purple-500" />,
      title: "Your Data is Yours",
      description: "All your data is stored locally on your computer, ensuring complete privacy.",
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Lightning Fast",
      description: "Built for speed with modern technologies for the best user experience.",
    },
    {
      icon: <Database className="h-6 w-6 text-orange-500" />,
      title: "Multi-Database Support",
      description: "Generate migrations for PostgreSQL, MySQL, SQLite and more database systems.",
    },
    {
      icon: <Code className="h-6 w-6 text-red-500" />,
      title: "Framework Ready",
      description: "Export to Laravel, Django, TypeORM and other popular frameworks instantly.",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col items-center text-center p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
            <div className="flex-shrink-0 p-3 bg-muted/50 rounded-full mb-3">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};