import {
  Paper,
  Typography,
  Box
} from "@mui/material";

type HeadlineCardProps = {
  variant?: 'primary' | 'secondary';
  title: string;
  subtitle: string;
  imageUrl?: string;
};

const titleSx = {
  fontWeight: 600,
  lineHeight: 1.4,
  letterSpacing: 0,
} as const;

const subtitleSx = {
  fontWeight: 400,
  lineHeight: 1.3,
  letterSpacing: 0,
} as const;

const headlinePrimarySx = {
  ...titleSx,
  fontSize: "1.125rem",
} as const;

const headlineSecondarySx = {
  ...titleSx,
  fontSize: "1rem",
} as const;

const headlineSubPrimarySx = {
  ...subtitleSx,
  fontSize: "0.875rem",
} as const;

const headlineSubSecondarySx = {
  ...subtitleSx,
  fontSize: "0.75rem",
} as const;

export const HeadlineCard: React.FC<HeadlineCardProps> = ({ variant = 'primary', title, subtitle, imageUrl }) => {
  const isPrimary = variant === 'primary';

  return (
    <Paper
      sx={{
        height: "100%",
        flex: 1,
        p: isPrimary ? 2.5 : 1.75,
        borderRadius: 5,
        bgcolor: "background.componentPrimary",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        overflow: "hidden",
        position: "relative",
        cursor: imageUrl ? "pointer" : "default",
        "&:hover .headline-bg": {
          transform: "scale(1)",
          filter: "blur(0px)",
        },
      }}
    >
      {imageUrl && (
        <>
          <Box
            className={"headline-bg"}
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(6px)",
              transform: "scale(1.05)",
              transition: "transform 0.25s ease-out, filter 0.15s ease-out",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.5) 40%, rgba(15, 23, 42, 0.2))",
            }}
          />
        </>
      )}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: isPrimary ? 1.25 : 0.5,
        }}
      >
        <Typography
          sx={isPrimary ? { ...headlinePrimarySx } : { ...headlineSecondarySx }}
          color="text.primary"
        >
          {title}
        </Typography>
        <Typography
          sx={isPrimary ? headlineSubPrimarySx : headlineSubSecondarySx}
          color="text.secondary"
        >
          {subtitle}
        </Typography>
      </Box>
    </Paper>
  );
};
