import { useState, useId, ChangeEvent } from "react"
import { UseFormReturn, useController } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormData } from "../../config/utils"
import { licenses } from "@/lib/licenses"
import { useSubmitFormHotkeys } from "../../hooks/use-hooks"
import { Input } from "@/components/ui/input"
import { useUser } from "@clerk/nextjs"
import { Switch } from "@/components/ui/switch"
import {
  makeSlugFromName,
  useIsCheckSlugAvailable,
} from "../../hooks/use-is-check-slug-available"
import { usePrefillAutogeneratedSlug } from "../../hooks/use-name-slug-form"
import Link from "next/link"
import { cn } from "@/lib/utils"

export const ComponentDetailsForm = ({
  form,
  handleSubmit,
  hotkeysEnabled = true,
  isSlugReadOnly = true,
  publishAsUserId,
  showOptionalFields = true,
  placeholderName = "",
  isFirstStep = false,
}: {
  form: UseFormReturn<FormData>
  handleSubmit?: (event: React.FormEvent) => void
  isSubmitting?: boolean
  hotkeysEnabled?: boolean
  isSlugReadOnly?: boolean
  publishAsUserId?: string
  showOptionalFields?: boolean
  placeholderName?: string
  isEditMode?: boolean
  isFirstStep?: boolean
}) => {
  const { user: currentUser } = useUser()
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const slug = form.watch("component_slug")
  const userId = publishAsUserId ?? currentUser?.id

  const {
    isAvailable: slugAvailable,
    isChecking: isSlugChecking,
    error: slugError,
  } = useIsCheckSlugAvailable({
    slug,
    userId: userId ?? "",
    type: "component",
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

  if (handleSubmit) {
    useSubmitFormHotkeys(form, handleSubmit, hotkeysEnabled)
  }

  const nameId = useId()
  const slugId = useId()
  const descriptionId = useId()
  const registryId = useId()
  const licenseId = useId()
  const websiteId = useId()
  const defaultRows = 2

  const handleTextareaInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    textarea.style.height = "auto"

    const style = window.getComputedStyle(textarea)
    const borderHeight =
      parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth)

    const newHeight = textarea.scrollHeight + borderHeight

    textarea.style.height = `${newHeight}px`
  }

  const { field: nameField } = useController({
    name: "name",
    control: form.control,
    rules: { required: true },
  })

  const { field } = useController({
    name: "website_url",
    control: form.control,
    defaultValue: "",
    rules: {
      onChange: (e) => {
        const rawValue = e.target.value

        // Remove any protocols from input
        const cleanUrl = rawValue
          .trim()
          .replace(/^(https?:\/\/)+(www\.)?/, "")
          .replace(/\/$/, "")

        // Simple URL validation
        const urlRegex =
          /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+([/?].*)?$/
        const isValid = urlRegex.test(cleanUrl)

        if (cleanUrl && !isValid) {
          form.setError("website_url", {
            type: "manual",
            message: "Please enter a valid URL",
          })
        } else {
          form.clearErrors("website_url")
        }

        // Store with https:// in form
        const formValue = cleanUrl ? `https://${cleanUrl}` : ""
        return formValue
      },
    },
  })
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={nameId}>
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id={nameId}
            ref={nameField.ref}
            placeholder={`e.g. "${(placeholderName || "Button").replace(/([a-z])([A-Z])/g, "$1 $2")}"`}
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
            placeholder={`e.g. "${makeSlugFromName(placeholderName || "Button")}"`}
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

      {showOptionalFields && (
        <div className="space-y-6">
          <div
            className={cn(
              "grid gap-4",
              isFirstStep ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            <div className="space-y-2">
              <Label htmlFor={descriptionId}>
                Description <span className="text-destructive">*</span>
              </Label>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    id={descriptionId}
                    placeholder="Add some description to help others discover your component"
                    className="min-h-[none] resize-none"
                    rows={defaultRows}
                    required
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      handleTextareaInput(e)
                    }}
                    ref={(e) => {
                      if (e) {
                        const style = window.getComputedStyle(e)
                        const lineHeight = parseInt(style.lineHeight)
                        const borderHeight =
                          parseInt(style.borderTopWidth) +
                          parseInt(style.borderBottomWidth)
                        const paddingHeight =
                          parseInt(style.paddingTop) +
                          parseInt(style.paddingBottom)
                        const initialHeight =
                          lineHeight * defaultRows +
                          borderHeight +
                          paddingHeight
                        e.style.height = `${initialHeight}px`
                      }
                    }}
                  />
                )}
              />
              <p
                className="text-xs text-muted-foreground"
                role="region"
                aria-live="polite"
              >
                A brief description of what your component does
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Pricing <span className="text-destructive">*</span>
                </Label>
                <Link
                  href="/settings/payouts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground flex gap-2 pb-2"
                >
                  View payouts
                  <svg
                    className="ml-1 h-3 w-3"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </Link>
              </div>
              <div className="border-input relative flex w-full items-start gap-2 rounded-md border p-3 shadow-xs outline-none has-data-[state=checked]:border-ring">
                <Switch
                  id="is-paid"
                  checked={form.watch("is_paid") || false}
                  onCheckedChange={(checked) => {
                    form.setValue("is_paid", checked, { shouldValidate: true })
                    form.setValue("price", checked ? 5 : 0, {
                      shouldValidate: true,
                    })
                    // Set MPL-2.0 license for paid components, MIT for free
                    form.setValue("license", checked ? "mpl-2.0" : "mit", {
                      shouldValidate: true,
                    })
                  }}
                  className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                />
                <div className="grid grow gap-[4px]">
                  <Label htmlFor="is-paid">
                    Paid Component{" "}
                    <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
                      ($0.70 per unlock)
                    </span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Earn money when others use your component
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "grid gap-4",
              isFirstStep ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            <div className="space-y-2">
              <Label htmlFor={registryId}>
                Component type <span className="text-destructive">*</span>
              </Label>
              <FormField
                control={form.control}
                name="registry"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    required
                  >
                    <SelectTrigger
                      id={registryId}
                      className="[&_[data-desc]]:hidden"
                    >
                      <SelectValue placeholder="Select component type" />
                    </SelectTrigger>
                    <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                      <SelectItem value="ui">
                        UI Component
                        <span
                          className="mt-1 block text-xs text-muted-foreground"
                          data-desc
                        >
                          Reusable interface elements like buttons, inputs, and
                          cards
                        </span>
                      </SelectItem>
                      <SelectItem value="hooks">
                        Hook
                        <span
                          className="mt-1 block text-xs text-muted-foreground"
                          data-desc
                        >
                          Custom React hooks for state and logic management
                        </span>
                      </SelectItem>
                      <SelectItem value="blocks">
                        Block
                        <span
                          className="mt-1 block text-xs text-muted-foreground"
                          data-desc
                        >
                          Larger sections like Hero, Features, or Testimonials
                        </span>
                      </SelectItem>
                      <SelectItem value="icons">
                        Icon
                        <span
                          className="mt-1 block text-xs text-muted-foreground"
                          data-desc
                        >
                          Custom icon components and icon sets
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p
                className="text-xs text-muted-foreground"
                role="region"
                aria-live="polite"
              >
                The category your component belongs to
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={licenseId}>
                License <span className="text-destructive">*</span>
              </Label>
              <FormField
                control={form.control}
                name="license"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    required
                    disabled={form.watch("is_paid")}
                  >
                    <SelectTrigger id={licenseId}>
                      <SelectValue placeholder="Select a license" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(licenses).map(([key, license]) => (
                        <SelectItem key={key} value={license.value}>
                          {license.label}
                          {form.watch("is_paid") && license.value === "mpl-2.0"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p
                className="text-xs text-muted-foreground"
                role="region"
                aria-live="polite"
              >
                {form.watch("is_paid")
                  ? "Paid components must use the Mozilla Public License 2.0"
                  : "Choose how others can use your component"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={websiteId}>Website URL</Label>
            <div className="relative">
              <Input
                type="text"
                id={websiteId}
                value={
                  field.value?.replace(/^(https?:\/\/)+(www\.)?/, "") || ""
                }
                onChange={(e) => field.onChange(e)}
                placeholder="your-website.com"
                className="w-full peer ps-16"
              />
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
                https://
              </span>
            </div>
            {form.formState.errors.website_url ? (
              <p
                className="text-xs text-destructive"
                role="region"
                aria-live="polite"
              >
                {form.formState.errors.website_url.message}
              </p>
            ) : (
              <p
                className="text-xs text-muted-foreground"
                role="region"
                aria-live="polite"
              >
                Link to your component's documentation or demo
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
