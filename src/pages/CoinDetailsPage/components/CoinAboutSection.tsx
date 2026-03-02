import { Box, Paper, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useEffect, useMemo, useRef, useState } from "react";

type CoinAboutSectionProps = {
  html: string;
  previewLines?: number;
};

export const CoinAboutSection: React.FC<CoinAboutSectionProps> = ({ html, previewLines = 7 }) => {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const collapsedHeightPx = useMemo(() => Math.round(previewLines * 14 * 1.4), [previewLines]);

  useEffect(() => {
    const target = contentRef.current;
    if (!target) {
      return;
    }

    const updateHeight = () => {
      setExpandedHeight(target.scrollHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [html]);

  return (
    <Paper
      elevation={0}
      sx={{
        background: "none",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Box
          ref={contentRef}
          sx={{
            color: "text.secondary",
            fontSize: 14,
            lineHeight: 1.4,
            maxHeight: isInfoExpanded
              ? `${expandedHeight}px`
              : `${collapsedHeightPx}px`,
            overflow: "hidden",
            transition: "max-height 280ms ease",
            willChange: "max-height",
            "& p": {
              margin: 0,
            },
            "& p:not(:has(+ p))": {
              marginBottom: 1,
            },
            "& h1, & h2": {
              margin: 0,
              marginBottom: 0.5,
              color: "text.primary",
              fontSize: 16,
              fontWeight: 700,
              lineHeight: 1,
            },
            "& ul, & ol": {
              margin: 0,
              paddingLeft: "18px",
            },
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Box>

      <Box
        sx={{
          mt: 1,
          display: "flex",
          justifySelf: "flex-end",
          alignItems: "center",
          gap: 0.5,
          color: "text.secondary",
          lineHeight: 1,
          cursor: "pointer",
          userSelect: "none",
          width: "fit-content",
        }}
        onClick={() => setIsInfoExpanded((prev) => !prev)}
        role="button"
        aria-expanded={isInfoExpanded}
      >
        <Typography sx={{ fontWeight: 500, fontSize: 16 }}>
          {isInfoExpanded ? "Скрыть" : "Больше"}
        </Typography>
        {isInfoExpanded ? (
          <KeyboardArrowUpIcon sx={{ fontSize: 24, mb: 0.25 }} />
        ) : (
          <KeyboardArrowDownIcon sx={{ fontSize: 24, mb: 0.25 }} />
        )}
      </Box>
    </Paper>
  );
};
