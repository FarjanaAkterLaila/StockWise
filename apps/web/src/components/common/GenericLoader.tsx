import React from "react";
import { Boxes } from "lucide-react";
import {
  LoaderContainer,
  SpinnerWrapper,
  SpinnerRing,
  SpinnerIconWrap,
  LoaderText,
  LoaderSubtext,
} from "./GenericLoader.styles";

interface GenericLoaderProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
}

export const GenericLoader: React.FC<GenericLoaderProps> = ({
  message = "Initializing StockWise session...",
  subtext = "Synchronizing ERP database & credentials",
  fullScreen = false,
}) => {
  return (
    <LoaderContainer $fullScreen={fullScreen} role="status" aria-live="polite">
      <SpinnerWrapper>
        <SpinnerRing />
        <SpinnerIconWrap>
          <Boxes size={20} />
        </SpinnerIconWrap>
      </SpinnerWrapper>
      {message && <LoaderText>{message}</LoaderText>}
      {subtext && <LoaderSubtext>{subtext}</LoaderSubtext>}
    </LoaderContainer>
  );
};
