"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function SkillsInput({
  value,
  onChange,
  placeholder = "Add a skill and press Enter",
}: {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function addSkill() {
    const skill = draft.trim();
    if (!skill || value.includes(skill)) return;
    onChange([...value, skill]);
    setDraft("");
  }

  function removeSkill(skill: string) {
    onChange(value.filter((item) => item !== skill));
  }

  return (
    <div className="space-y-3">
      <Input
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addSkill();
          }
        }}
        placeholder={placeholder}
        value={draft}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <Badge className="gap-1 pr-1" key={skill} variant="secondary">
              {skill}
              <button
                aria-label={`Remove ${skill}`}
                className="rounded-full p-0.5 hover:bg-[#F2F2F2]"
                onClick={() => removeSkill(skill)}
                type="button"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
