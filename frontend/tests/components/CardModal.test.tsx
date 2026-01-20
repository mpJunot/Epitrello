import React from "react";
import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardModal from "../../components/CardModal";

function waitForEvent<T = unknown>(name: string): Promise<T> {
  return new Promise((resolve) => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as T;
      window.removeEventListener(name, handler as EventListener);
      resolve(detail);
    };
    window.addEventListener(name, handler as EventListener);
  });
}

async function triggerAndWait<T = unknown>(name: string, action: () => Promise<void> | void) {
  const pending = waitForEvent<T>(name);
  await action();
  return pending;
}

describe("CardModal", () => {
  const baseCard = {
    id: "card-1",
    title: "Initial Title",
    description: "",
    labels: [],
    assignees: [],
    checklists: [],
    dueDate: { date: new Date().toISOString(), isComplete: false },
    comments: [],
  };

  test("edits title and dispatches event", async () => {
    render(<CardModal card={baseCard} isOpen={true} onClose={() => {}} />);

    const titleHeading = screen.getByRole("heading", { name: /initial title/i });
    await userEvent.click(titleHeading);

    const titleInput = screen.getByLabelText("Edit card title");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "New Title");

    const detail = await triggerAndWait<{ cardId: string; title: string }>(
      "epitrello:card-title-updated",
      async () => {
        await userEvent.keyboard("{Enter}");
      }
    );

    expect(detail.cardId).toBe("card-1");
    expect(detail.title).toBe("New Title");
  });

  test("edits description and dispatches event", async () => {
    render(<CardModal card={baseCard} isOpen={true} onClose={() => {}} />);

    await userEvent.click(screen.getByText(/add a more detailed description/i));

    const textarea = screen.getByPlaceholderText(/add a more detailed description/i);
    await userEvent.type(textarea, "Some description");

    const detail = await triggerAndWait<{ cardId: string; description: string }>(
      "epitrello:card-description-updated",
      async () => {
        await userEvent.click(screen.getByRole("button", { name: /save/i }));
      }
    );

    expect(detail.cardId).toBe("card-1");
    expect(detail.description).toBe("Some description");
  });

  test("toggles due date complete and dispatches event", async () => {
    render(<CardModal card={baseCard} isOpen={true} onClose={() => {}} />);

    const checkbox = screen.getByRole("checkbox");
    const detail = await triggerAndWait<{ cardId: string; dueDate: { date: string; isComplete: boolean } }>(
      "epitrello:card-duedate-updated",
      async () => {
        await userEvent.click(checkbox);
      }
    );

    expect(detail.cardId).toBe("card-1");
    expect(detail.dueDate.isComplete).toBe(true);
  });

  test("assigns a member via Add to card > Members", async () => {
    render(<CardModal card={baseCard} isOpen={true} onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: /members/i }));

    const detail = await triggerAndWait<{ cardId: string; members: Array<{ id: string }> }>(
      "epitrello:card-members-updated",
      async () => {
        const memberItem = await screen.findByText(/alice martin/i);
        await userEvent.click(memberItem);
      }
    );

    expect(detail.cardId).toBe("card-1");
    expect(detail.members.length).toBe(1);
  });

  test("assigns a label via Add to card > Labels", async () => {
    render(<CardModal card={baseCard} isOpen={true} onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: /labels/i }));

    const detail = await triggerAndWait<{ cardId: string; labels: Array<{ id: string }> }>(
      "epitrello:card-labels-updated",
      async () => {
        const labelItem = await screen.findByText(/bug/i);
        await userEvent.click(labelItem);
      }
    );

    expect(detail.cardId).toBe("card-1");
    expect(detail.labels.length).toBe(1);
  });

  test("adds a comment with Ctrl+Enter and dispatches event", async () => {
    render(<CardModal card={baseCard} isOpen={true} onClose={() => {}} />);

    const textarea = screen.getByPlaceholderText(/write a comment/i);
    await userEvent.type(textarea, "Hello world");

    const detail = await triggerAndWait<{ cardId: string; comments: Array<Record<string, unknown>> }>(
      "epitrello:card-comments-updated",
      async () => {
        fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
      }
    );

    expect(detail.cardId).toBe("card-1");
    expect(detail.comments.length).toBe(1);
  });
});
