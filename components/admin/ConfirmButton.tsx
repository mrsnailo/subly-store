"use client";

type Props = {
  action: () => Promise<void>;
  confirm: string;
  children: React.ReactNode;
  className?: string;
};

/** A form whose submit runs a bound server action after a confirm() prompt. */
export function ConfirmButton({ action, confirm, children, className }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
      style={{ display: "inline" }}
    >
      <button className={className ?? "iconlink btn-danger"} type="submit">
        {children}
      </button>
    </form>
  );
}
