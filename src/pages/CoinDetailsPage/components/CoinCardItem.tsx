import { Box, Typography, Paper } from "@mui/material";
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
  // Нормализация URL изображения
  const imageUrl = card.image
    ? card.image.startsWith('//')
      ? `https:${card.image}`
      : card.image
    : '';

  const handleClick = () => {
    if (variant === 'news' && card.url) {
      window.open(card.url, '_blank');
    }
  };

  if (variant === 'guide') {
    return (
      <Box
        sx={{
          flex: "0 0 auto",
          width: { xs: 200, md: 200 },
          display: "flex",
          flexDirection: "column",
          gap: 1,
          bgcolor: "background.componentPrimary"
        }}
      >
        <Box
          sx={{
            borderRadius: 1,
            overflow: "hidden",
            height: 125,
            backgroundImage: `url(${imageUrl})`,
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
          }}
        >
          {card.title}
        </Typography>
      </Box>
    );
  }

  // Вариант "news"
  return (
    <Paper
      elevation={0}
      onClick={handleClick}
      sx={{
        width: { xs: 100, md: 260 },
        cursor: "pointer",
        transition: "transform 0.25s ease-out",
        "&:hover": {
          transform: "scale(1.05)",
        },
        "&:hover .card-img": {
          transform: "scale(1.05)",
        },
        overflow: "hidden",
        borderRadius: 1,
        bgcolor: "background.componentPrimary",
      }}
    >
      {imageUrl && (
        <Box
          className={"card-img"}
          sx={{
            height: 125,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "scale(1)",
            transition: "transform 0.25s ease-out",
          }}
        />
      )}
      <Box sx={{ pt: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: 16,
            lineHeight: 1.2,
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
          }}
        >
          {card.title}
        </Typography>
        {card.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {card.description}
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "start",
            mt: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {card.author}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {card.date}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};