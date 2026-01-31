"use client"

export default function DeleteButton({ id }: { id: number }) {
  async function deleteItem() {
    await fetch("/api/items", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    
  }

  return (
    <button onClick={deleteItem}>
      Delete
    </button>

  );
}