import React, { useState, useRef, useId } from "react"
import { useController, UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FormData } from "../../config/utils"
import { useUser } from "@clerk/nextjs"
import {
  makeSlugFromName,
  useIsCheckSlugAvailable,
} from "../../hooks/use-is-check-slug-available"
import { usePrefillAutogeneratedSlug } from "../../hooks/use-name-slug-form"

interface NameSlugFormProps {
  form: UseFormReturn<FormData>
  publishAsUserId?: string
  isSlugReadOnly: boolean
  placeholderName: string
}

export function NameSlugForm({
  form,
  publishAsUserId,
  isSlugReadOnly,
  placeholderName,
}: NameSlugFormProps) {
  const { user: currentUser } = useUser()
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const slug = form.watch("component_slug")
  const userId = publishAsUserId ?? currentUser?.id
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const nameId = useId()
  const slugId = useId()

  const {
    isAvailable: slugAvailable,
    isChecking: isSlugChecking,
    error: slugError,
  } = useIsCheckSlugAvailable({
    slug,
    type: "component",
    userId: userId ?? "",
    enabled: !isSlugReadOnly,
  })

  if (
    slugAvailable !== undefined &&
    form.getValues("slug_available") !== slugAvailable
  ) {
    form.setValue("slug_available", slugAvailable)
  }

  usePrefillAutogeneratedSlug({
    form,
    isSlugReadOnly,
    isSlugManuallyEdited,
    publishAsUserId: userId,
  })

  const { field: nameField } = useController({
    name: "name",
    control: form.control,
    rules: { required: true },
  })

  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={nameId}>
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={nameId}
            ref={(e) => {
              nameField.ref(e)
              nameInputRef.current = e
            }}
            placeholder={`e.g. "${placeholderName.replace(/([a-z])([A-Z])/g, "$1 $2")}"`}
            value={nameField.value}
            onChange={nameField.onChange}
            onBlur={nameField.onBlur}
            className="w-full text-foreground"
            required
          />
          <p
            className="text-xs text-muted-foreground"
            role="region"
            aria-live="polite"
          >
            The display name of your component
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={slugId}>
            Slug <span className="text-destructive">*</span>
          </Label>
          <Input
            id={slugId}
            {...form.register("component_slug", { required: true })}
            className="w-full"
            placeholder={`e.g. "${makeSlugFromName(placeholderName)}"`}
            disabled={
              isSlugReadOnly || (isSlugChecking && !isSlugManuallyEdited)
            }
            onChange={(e) => {
              setIsSlugManuallyEdited(true)
              form.setValue("component_slug", e.target.value)
            }}
            required
          />
          <p
            className="text-xs text-muted-foreground"
            role="region"
            aria-live="polite"
          >
            Used in the URL and imports, can't be changed later
          </p>
        </div>
      </div>

      {slugError && (
        <p className="text-red-500 text-sm mt-2">{slugError.message}</p>
      )}

      {slug?.length > 0 && !slugError && isSlugManuallyEdited && (
        <>
          {isSlugChecking ? (
            <p className="text-muted-foreground text-sm mt-2">
              Checking slug availability...
            </p>
          ) : slugAvailable === true ? (
            <p className="text-green-500 text-sm mt-2">
              This slug is available
            </p>
          ) : (
            <p className="text-red-500 text-sm mt-2">
              You already have a component with this slug
            </p>
          )}
        </>
      )}
    </div>
  )
}
