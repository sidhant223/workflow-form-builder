import { useState } from "react";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import Textarea from "../components/ui/textarea";
import Select from "../components/ui/select";
import Checkbox from "../components/ui/checkbox";
import Radio from "../components/ui/radio";
import Card from "../components/ui/card";
import Badge from "../components/ui/badge";
import Modal from "../components/ui/modal";
import Toast from "../components/ui/toast";

function Components() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }
  const [plan, setPlan] = useState("single");

  const showToast = (message, type) => setToast({ message, type });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Component Showcase</h1>
        <p className="mt-1 text-gray-600">
          A live gallery of the reusable UI components used across the app.
        </p>
      </div>

      {/* BUTTONS */}
      <Card title="Buttons">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="outline">Outline</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
      </Card>

      {/* INPUTS */}
      <Card title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Text Input" placeholder="Enter form name" />
          <Input label="Email Input" type="email" placeholder="you@example.com" />
          <Input label="Password Input" type="password" placeholder="••••••••" />
          <Input label="Number Input" type="number" placeholder="0" />
          <Input
            label="With Error"
            placeholder="Invalid value"
            error="This field is required"
          />
          <Input label="Disabled" placeholder="Disabled input" disabled />
          <div className="sm:col-span-2">
            <Textarea label="Textarea" placeholder="Write a description..." />
          </div>
        </div>
      </Card>

      {/* DROPDOWN */}
      <Card title="Dropdown / Select">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Field Type"
            placeholder="Select a type"
            options={["Text", "Number", "Dropdown", "Checkbox"]}
          />
          <Select label="Department" options={["HR", "IT", "Finance"]} />
        </div>
      </Card>

      {/* CHECKBOX / RADIO */}
      <Card title="Checkbox & Radio">
        <div className="flex flex-wrap gap-8">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Checkbox</p>
            <Checkbox label="Required Field" />
            <Checkbox label="Read Only" disabled />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Radio Group</p>
            <Radio
              label="Single Select"
              name="plan"
              value="single"
              checked={plan === "single"}
              onChange={(e) => setPlan(e.target.value)}
            />
            <Radio
              label="Multiple Select"
              name="plan"
              value="multiple"
              checked={plan === "multiple"}
              onChange={(e) => setPlan(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* BADGES */}
      <Card title="Badges">
        <div className="flex flex-wrap gap-3">
          <Badge text="Approved" type="success" />
          <Badge text="Draft" type="neutral" />
          <Badge text="Pending" type="warning" />
          <Badge text="Rejected" type="error" />
        </div>
      </Card>

      {/* MODAL */}
      <Card title="Modal">
        <p className="mb-4 text-sm text-gray-600">
          A reusable modal with overlay, close button and Escape-to-close.
        </p>
        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Delete Form?"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setIsModalOpen(false);
                  showToast("Form deleted", "error");
                }}
              >
                Confirm
              </Button>
            </>
          }
        >
          Are you sure you want to delete this form? This action cannot be undone.
        </Modal>
      </Card>

      {/* TOAST */}
      <Card title="Toast Notifications">
        <p className="mb-4 text-sm text-gray-600">
          Click to trigger a toast. It auto-dismisses after a few seconds.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => showToast("Form saved successfully", "success")}>
            Success Toast
          </Button>
          <Button
            variant="danger"
            onClick={() => showToast("Error saving form", "error")}
          >
            Error Toast
          </Button>
        </div>
      </Card>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Components;
