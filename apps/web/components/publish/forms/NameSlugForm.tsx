import React, { useState, useRef } from "react"
import { useController, UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FormData } from "../utils"
import { useUser } from "@clerk/nextjs"
import {
  makeSlugFromName,
  useIsCheckSlugAvailable,
} from "../hooks/use-is-check-slug-available"
import { usePrefillAutogeneratedSlug,  } from "../hooks/use-name-slug-form"

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

  const {
    isAvailable: slugAvailable,
    isChecking: isSlugChecking,
    error: slugError,
  } = useIsCheckSlugAvailable({
    slug,
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
    <div className="flex flex-col gap-4 w-full">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          ref={(e) => {
            nameField.ref(e)
            nameInputRef.current = e
          }}
          placeholder={`e.g. "${placeholderName.replace(/([a-z])([A-Z])/g, "$1 $2")}"`}
          value={nameField.value}
          onChange={nameField.onChange}
          onBlur={nameField.onBlur}
          className="mt-1 w-full text-foreground"
        />
      </div>

      <div>
        <Label htmlFor="component_slug">Slug</Label>
        <Input
          id="component_slug"
          {...form.register("component_slug", { required: true })}
          className="mt-1 w-full"
          placeholder={`e.g. "${makeSlugFromName(placeholderName)}"`}
          disabled={isSlugReadOnly || (isSlugChecking && !isSlugManuallyEdited)}
          onChange={(e) => {
            setIsSlugManuallyEdited(true)
            form.setValue("component_slug", e.target.value)
          }}
        />

        {!slug && (
          <p className="text-muted-foreground text-sm mt-1">
            Slug is used in the URL of your component and file imports, and
            can't be changed later
          </p>
        )}

        {slugError && (
          <p className="text-red-500 text-sm mt-1">{slugError.message}</p>
        )}

        {slug?.length > 0 && !slugError && isSlugManuallyEdited && (
          <>
            {isSlugChecking ? (
              <p className="text-muted-foreground text-sm mt-1">
                Checking slug availability...
              </p>
            ) : slugAvailable === true ? (
              <p className="text-green-500 text-sm mt-1">
                This slug is available
              </p>
            ) : (
              <p className="text-red-500 text-sm mt-1">
                You already have a component with this slug
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
