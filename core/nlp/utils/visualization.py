import matplotlib.pyplot as plt

class Visualizer:
    def plot_top_entities(self, entities, top_n=10):
        """Plot the top N most common entities."""
        labels, counts = zip(*entities)
        plt.bar(labels, counts)
        plt.xlabel("Entities")
        plt.ylabel("Frequency")
        plt.title(f"Top {top_n} Entities in Clinical Trial Descriptions")
        plt.xticks(rotation=45)
        plt.show()