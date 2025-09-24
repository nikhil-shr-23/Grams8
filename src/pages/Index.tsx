import Layout from "@/components/Layout";

interface IndexProps {
  onInstallAppRequest: () => void;
}

const Index = ({ onInstallAppRequest }: IndexProps) => {
  return (
    <div className="w-screen h-screen bg-background">
      <Layout onInstallAppRequest={onInstallAppRequest} />
    </div>
  );
};

export default Index;