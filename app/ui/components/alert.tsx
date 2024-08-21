import { cn } from "@/app/lib/util";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";

interface Props {
  title: string;
  description?: string;
  variant: "success" | "info" | "attention" | "ghost";
}
export default function Alert(props: Props) {
  const { title, description, variant } = props;
  const IconComponent = style[variant].icon.component;
  const iconClassName = style[variant].icon.className;
  const titleClassName = style[variant].title;
  const descriptionClassName = style[variant].description;
  const backgroundClassName = style[variant].background;

  return (
    <>
      <div className={cn("rounded-md p-4", backgroundClassName)}>
        <div className="flex">
          <div className="flex-shrink-0">
            <IconComponent className={cn("h-5 w-5", iconClassName)} />
          </div>
          <div className="ml-3">
            <h3 className={cn("text-sm font-medium", titleClassName)}>
              {title}
            </h3>
            {description && (
              <div className={cn("mt-2 text-sm", descriptionClassName)}>
                <p>{description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const style = {
  info: {
    icon: {
      component: ExclamationTriangleIcon,
      className: "text-blue-400",
    },
    title: "text-blue-800",
    description: "text-blue-700",
    background: "bg-blue-50",
  },
  attention: {
    icon: {
      component: InformationCircleIcon,
      className: "text-yellow-400",
    },
    title: "text-yellow-800",
    description: "text-yellow-700",
    background: "bg-yellow-50",
  },
  success: {
    icon: {
      component: CheckCircleIcon,
      className: "text-green-400",
    },
    title: "text-green-800",
    description: "text-green-700",
    background: "bg-green-50",
  },
  ghost: {
    icon: {
      component: ExclamationTriangleIcon,
      className: "text-gray-400",
    },
    title: "text-gray-800",
    description: "text-gray-700",
    background: "bg-gray-50",
  },
};
