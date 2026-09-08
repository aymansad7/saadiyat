import { describe, expect, it } from "vitest";
import { limitDatasetsToProjectScope } from "./inventorySync";

describe("project-scoped inventory refresh", () => {
  it("keeps only the explicitly captured project and never implies removal of other projects", () => {
    const scoped = limitDatasetsToProjectScope({
      saadiyat: { projects: [
        { slug: "sei-saadiyat", name: "Sei", buildings: [] },
        { slug: "yas-park-place", name: "Yas Park", buildings: [] },
      ] },
      other: { projects: [{ slug: "al-ghadeer-parks-1", name: "Parks", buildings: [] }] },
    }, [{ dataset: "saadiyat", projectSlug: "sei-saadiyat" }]);

    expect(scoped.saadiyat.projects.map(project => project.slug)).toEqual(["sei-saadiyat"]);
    expect(scoped.other.projects).toEqual([]);
  });
});
