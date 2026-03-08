import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";

export type Stat = {
  value: string;
  label: string;
};

export type StatsBarProps = {
  stats: Stat[];
};

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <section className="py-16 md:py-20 border-y border-surface-border">
      <Container width="default">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-primary md:text-5xl font-mono tracking-tight">
                {stat.value}
              </p>
              <Text variant="small" className="mt-2">
                {stat.label}
              </Text>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default StatsBar;
