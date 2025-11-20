import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/Loading";

const EContractTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch templates
    setTemplates([
      {
        id: "template-1",
        name: "Standard Co-Ownership Agreement",
        type: "Ownership",
        status: "Active",
        version: "v2.1",
        lastModified: new Date().toISOString(),
      },
      {
        id: "template-2",
        name: "EV Usage Terms",
        type: "Usage",
        status: "Draft",
        version: "v1.4",
        lastModified: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">
          E-Contract Templates
        </h1>
        <Button variant="accent">Create Template</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-neutral-800">
                      {template.name}
                    </h3>
                    <p className="text-sm text-neutral-600">{template.type}</p>
                  </div>
                  <Badge
                    variant={
                      template.status === "Active" ? "success" : "default"
                    }
                  >
                    {template.status}
                  </Badge>
                </div>
                <div className="text-sm text-neutral-600">
                  <p>Version: {template.version}</p>
                  <p>
                    Last modified:{" "}
                    {new Date(template.lastModified).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 pt-4 border-t border-neutral-200">
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                  <Button variant="accent" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">No templates found</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EContractTemplates;
