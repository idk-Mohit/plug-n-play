import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface CardComponentProps {
  icon?: React.ReactNode;
  title?: string;
  footerText?: string;
  onClick?: () => void;
  styles?: {
    root?: string;
    title?: string;
    description?: string;
    footer?: string;
  };
  children?: React.ReactNode;
}

const CardComponent = ({
  styles,
  title,
  footerText,
  onClick,
  children: content,
}: CardComponentProps) => {
  return (
    <Card
      className={`bg-card rounded-lg border border-border p-6 cursor-pointer hover:bg-accent/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-primary/20 group animate-in fade-in slide-in-from-left-4 ${styles?.root}`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle
          className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${styles?.title}`}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={styles?.description}>{content}</CardContent>
      <CardFooter
        className={`flex-col items-start gap-1.5 text-sm text-muted-foreground ${styles?.footer}`}
      >
        {footerText}
      </CardFooter>
    </Card>
  );
};

export default CardComponent;
