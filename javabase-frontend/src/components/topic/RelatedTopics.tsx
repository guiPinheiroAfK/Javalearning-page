import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type RelatedTopic } from "@/types";

interface RelatedTopicsProps {
  topics: RelatedTopic[];
}

export function RelatedTopics({ topics }: RelatedTopicsProps) {
  if (topics.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Veja também</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Link key={topic.slug} to={`/topicos/${topic.slug}`}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardContent className="p-3">
                <Badge variant="outline" className="mb-2">
                  {CATEGORY_LABELS[topic.category]}
                </Badge>
                <p className="text-sm font-medium text-foreground">{topic.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
