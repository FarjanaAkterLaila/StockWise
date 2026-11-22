import React from 'react';
import { 
  CardContainer, 
  CardHeader, 
  CardTitle, 
  CardSubtitle, 
  CardAction, 
  CardBody 
} from './Card.styles';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
}) => {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <CardContainer className={className}>
      {hasHeader && (
        <CardHeader>
          <div>
            {title && (typeof title === 'string' ? <CardTitle>{title}</CardTitle> : title)}
            {subtitle && (typeof subtitle === 'string' ? <CardSubtitle>{subtitle}</CardSubtitle> : subtitle)}
          </div>
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      <CardBody>{children}</CardBody>
    </CardContainer>
  );
};
