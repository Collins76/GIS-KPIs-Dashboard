import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';
import { weatherData } from '@/lib/data';

export default function WeatherForecast() {
  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-glow">5-Day Forecast - Lagos</CardTitle>
        <Thermometer className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between space-x-2">
          {weatherData.map((day, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <span className="text-sm font-medium">{day.day}</span>
              <day.icon className={`h-8 w-8 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="font-bold">{day.temp}°C</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
