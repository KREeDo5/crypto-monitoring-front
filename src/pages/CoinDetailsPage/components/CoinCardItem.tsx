import { Box, Typography } from "@mui/material";
import type { GuideCard, NewsCard } from "../data.ts";

type CoinCardItemProps =
  | {
      variant: "guide";
      card: GuideCard;
    }
  | {
      variant: "news";
      card: NewsCard;
    };

export const CoinCardItem: React.FC<CoinCardItemProps> = ({ variant, card }) => {
  return (
    <Box
      sx={{
        flex: "0 0 auto",
        width: { xs: 200, md: 200 },
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          height: 125,
          p: 0,
          display: "block",
          backgroundImage: `url(${card.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <Typography
        sx={{
          color: "text.primary",
          fontWeight: 700,
          fontSize: 14,
          lineHeight: 1.15,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 4,
          height: variant === "news" ? "64px" : "unset",
        }}
      >
        {card.title}
      </Typography>

      {variant === "news" && (
        <>
          <Typography sx={{ color: "text.primary", fontWeight: 300, fontSize: 10, lineHeight: 1 }}>{card.author}</Typography>
          <Typography sx={{ color: "text.primary", fontWeight: 400, fontSize: 12, lineHeight: 1 }}>{card.date}</Typography>
        </>
      )}
    </Box>
  );
};
