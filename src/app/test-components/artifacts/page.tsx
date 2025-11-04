"use client";

import { ArtifactPreviewDrawer } from "@/components/tambo/artifact-preview-drawer";
import { useArtifactsStore } from "@/store/artifacts";

export default function ArtifactsTestPage() {
  const openSampleArtifact = () => {
    const id = `art-${Date.now()}`;
    const html = `<!doctype html><html><head><meta charset=\"utf-8\"/><style>body{font-family:ui-sans-serif,system-ui;padding:24px;}h1{margin-bottom:8px;}p{color:#374151}</style></head><body><h1>Sample Artifact</h1><p>This is a sandboxed HTML preview rendered via an iframe.</p></body></html>`;
    useArtifactsStore.getState().add({
      id,
      type: "code/html",
      title: "Sample Artifact",
      payload: { html },
      createdAt: Date.now(),
    } as any);
    useArtifactsStore.getState().openPreview(id);
  };

  const openBudgetTrackerMarkdown = () => {
    const id = `art-${Date.now()}`;
    const markdown = `# Budget Tracker App\n\nThis app helps you keep track of your income, expenses, and balance over time. Here's how it works based on your spreadsheet:\n\n## Features\n- **Income Tracking**: Log your monthly or weekly income amounts.\n- **Expense Tracking**: Enter all your spending records, categorized by type (e.g., food, rent, utilities).\n- **Automatic Balance Calculation**: Your current balance is shown after each update (income minus expenses).\n- **Visualization**: View a bar or line graph showing trends in income, expenses, and balances.\n- **Editable Entries**: Add, modify, or delete income and expense records for flexible budget management.\n- **Monthly Summary**: See a summary for each period (e.g., month) including totals and averages.\n\n## Example Data Structure\n| Period | Income | Expenses | Balance |\n|--------|--------|----------|---------|\n| Jan    | $2000  | $1500    | $500    |\n| Feb    | $2500  | $2200    | $300    |\n| Mar    | $1800  | $1700    | $100    |\n| Apr    | $2100  | $1900    | $200    |\n\n## Core Logic (Pseudocode)\n\n\`\`\`python\nfor each period in data:\n    balance = income - expenses\n    update_balance(period, balance)\n\n\`\`\`\n\n## Visual Layout\n- **Data Table** for input and editing of records (Period, Income, Expenses, Balance)\n- **Graph** (bar or line) to visualize trends\n- **Add/Delete Row buttons** for quick management\n\n## Possible Extensions\n- Categorize expenses for detailed tracking\n- Set savings goals and track progress\n- Import/export as CSV\n- Notifications for overspending\n---\n\nFeel free to adapt this concept to your preferred platform (web, mobile, etc.). Let me know if you'd like specific code, UI mockups, or further features!`;
    useArtifactsStore.getState().add({
      id,
      type: "doc/markdown",
      title: "Budget Tracker App Concept",
      payload: { markdown },
      createdAt: Date.now(),
    } as any);
    useArtifactsStore.getState().openPreview(id);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Artifact Preview Test</h1>
        <p className="text-muted-foreground">
          Use this page to quickly validate the Artifact Preview Drawer and sandboxed iframe.
        </p>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Open a sample HTML artifact</h2>
          <p className="text-muted-foreground">
            Click the button to generate an in-memory artifact and open the preview drawer.
          </p>
          <button
            onClick={openSampleArtifact}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Open Sample Artifact Preview
          </button>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Open Budget Tracker (Markdown)</h2>
          <p className="text-muted-foreground">
            Generate a Markdown artifact describing a Budget Tracker and open the preview drawer.
          </p>
          <button
            onClick={openBudgetTrackerMarkdown}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Open Budget Tracker Markdown
          </button>
        </div>
      </div>

      <ArtifactPreviewDrawer />
    </div>
  );
}
