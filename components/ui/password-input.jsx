"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "./button";

export default function PasswordInput({
  name,
  placeholder = "Enter your password",
  setValue,
  resetTrigger,
  ...props
}) {
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Toggle visibility
  const toggleVisibility = () => setIsVisible((v) => !v);

  // Password strength rules
  const strengthChecks = [
    { regex: /.{8,}/, label: "At least 8 characters" },
    { regex: /[0-9]/, label: "At least 1 number" },
    { regex: /[a-z]/, label: "At least 1 lowercase letter" },
    { regex: /[A-Z]/, label: "At least 1 uppercase letter" },
  ];

  // Evaluate strength
  const strength = useMemo(() => {
    return strengthChecks.map((rule) => ({
      ...rule,
      met: rule.regex.test(password),
    }));
  }, [password]);

  const strengthScore = strength.filter((r) => r.met).length;

  const getStrengthColor = () => {
    if (strengthScore === 0) return "bg-border";
    if (strengthScore <= 1) return "bg-red-500";
    if (strengthScore === 2) return "bg-orange-400";
    if (strengthScore === 3) return "bg-yellow-400";
    return "bg-emerald-500";
  };

  const getStrengthLabel = () => {
    if (strengthScore === 0) return "Enter a password";
    if (strengthScore <= 2) return "Weak password";
    if (strengthScore === 3) return "Medium password";
    return "Strong password";
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setValue?.(name, val);
  };

  useEffect(() => {
    if (resetTrigger) setPassword("");
  }, [resetTrigger]);

  return (
    <div className="space-y-3">
      {/* Input with visibility toggle */}
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={isVisible ? "text" : "password"}
          value={password}
          onChange={handleChange}
          placeholder={placeholder}
          aria-describedby="password-strength-text"
          className="pr-10"
          {...props}
        />
        <Button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-0 top-0 flex h-full w-9 items-center justify-center rounded-e-md bg-transparent text-muted-foreground hover:text-foreground"
        >
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
      </div>

      {/* Strength meter */}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={4}
      >
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-500 ease-in-out ${getStrengthColor()}`}
          style={{ width: `${(strengthScore / 4) * 100}%` }}
        />
      </div>

      {/* Strength text */}
      <p
        id="password-strength-text"
        className="text-sm font-medium text-muted-foreground"
      >
        {getStrengthLabel()}. Must include:
      </p>

      {/* Rules list */}
      <ul className="space-y-1.5 text-sm">
        {strength.map((rule, i) => (
          <li key={i} className="flex items-center gap-2">
            {rule.met ? (
              <Check className="text-emerald-500" size={16} />
            ) : (
              <X className="text-muted-foreground" size={16} />
            )}
            <span className={rule.met ? "text-emerald-600" : "text-muted-foreground"}>
              {rule.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
