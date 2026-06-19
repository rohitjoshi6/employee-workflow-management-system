import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

interface RequestFormProps {
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}

const managerId = "33333333-3333-3333-3333-333333333333";

export function RequestForm({ onSubmit }: RequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    await onSubmit({
      title: formData.get("title"),
      description: formData.get("description"),
      requestType: formData.get("requestType"),
      priority: formData.get("priority"),
      managerId,
      dueDate: formData.get("dueDate")
    });

    event.currentTarget.reset();
    setIsSubmitting(false);
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input name="title" placeholder="New software license" required minLength={3} />
      </label>
      <label>
        Type
        <select name="requestType" defaultValue="equipment">
          <option value="equipment">Equipment</option>
          <option value="travel">Travel</option>
          <option value="training">Training</option>
          <option value="access">System access</option>
        </select>
      </label>
      <label>
        Priority
        <select name="priority" defaultValue="medium">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </label>
      <label>
        Due date
        <input name="dueDate" type="date" />
      </label>
      <label className="full-span">
        Description
        <textarea name="description" placeholder="Describe the business need and context." required minLength={10} />
      </label>
      <button type="submit" disabled={isSubmitting}>
        <Send size={16} />
        {isSubmitting ? "Submitting" : "Submit request"}
      </button>
    </form>
  );
}

