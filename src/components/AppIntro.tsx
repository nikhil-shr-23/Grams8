interface AppIntroProps {
  onCreate?: () => void;
  onExplore?: () => void;
}

export const AppIntro = ({ onCreate, onExplore }: AppIntroProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 bg-white rounded-md flex items-center justify-center shadow border">
          <span className="text-black font-bold text-2xl">G8</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          grams8
        </h1>
      </div>
      <div className="max-w-3xl mx-auto">
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
        Model your database visually and export anywhere — SQL, DBML, or JSON.
        </p>
        <div className="flex gap-3 justify-center mb-16">
          <button onClick={onCreate} className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:opacity-90">
            Create diagram
          </button>
          <button onClick={onExplore} className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-muted ">
            Explore features
          </button>
        </div>
      </div>
    </div>
  );
};