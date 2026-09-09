import { describe, expect, it } from "vitest";
import {
  buildDiscoveredProjectFromOfficialPage,
  classifyOfficialDirectoryProject,
  extractAldarDirectoryProjects,
} from "./aldarProjectDiscovery";

describe("official Aldar project discovery", () => {
  it("extracts titled project cards while ignoring non-project cultural links", () => {
    const cards = extractAldarDirectoryProjects(`
      {"title":"Marsa Al Saadiyat","isExploreDisabled":false,"navigateTo":"/uae/abudhabi/marsaalSaadiyat"}
      {"title":"Coming Soon","navigateTo":"/uae/abudhabi/fountaindistrict"}
      {"title":"Artisan District","navigateTo":"/uae/abudhabi/artisandistrict"}
      {"title":"Louvre Abu Dhabi","navigateTo":"/uae/abudhabi/louvre"}
    `);
    expect(cards).toEqual([{ projectName: "Marsa Al Saadiyat", sourcePath: "/uae/abudhabi/marsaalSaadiyat" }]);
  });

  it("classifies a newly discovered Saadiyat launch into the Saadiyat dataset", () => {
    expect(classifyOfficialDirectoryProject("Marsa Al Saadiyat")).toEqual({ dataset: "saadiyat", areaKey: "saadiyat" });
    expect(classifyOfficialDirectoryProject("Fahid Beach Residences")).toEqual({ dataset: "other", areaKey: "fahid-island" });
  });

  it("imports only a complete unit set and leaves AED 1 as an unpublished price", () => {
    const candidate = { projectName: "Marsa Al Saadiyat", sourcePath: "/uae/abudhabi/marsa", projectSlug: "marsa-al-saadiyat", dataset: "saadiyat" as const, areaKey: "saadiyat" as const };
    const complete = buildDiscoveredProjectFromOfficialPage(candidate, `
      {"unitType":"Villa","unitNumber":"Marsa-V-001","unitStatus":"Available","bedroomCount":5,"price":1}
      {"unitType":"Villa","unitNumber":"Marsa-V-002","unitStatus":"Available","bedroomCount":6,"price":10000000}
    `);
    expect(complete.reason).toBeUndefined();
    expect(complete.project?.unit_count).toBe(2);
    expect((complete.project?.buildings[0]?.units as Array<{ price_aed: number | null }>)[0]?.price_aed).toBeNull();
    expect((complete.project?.buildings[0]?.units as Array<{ price_aed: number | null }>)[1]?.price_aed).toBe(10000000);
    expect((complete.project?.buildings[0]?.units as Array<{ aldar_link: string | null }>)[0]?.aldar_link).toBeNull();
  });

  it("does not import a project page with incomplete unit identity fields", () => {
    const candidate = { projectName: "Marsa Al Saadiyat", sourcePath: "/uae/abudhabi/marsa", projectSlug: "marsa-al-saadiyat", dataset: "saadiyat" as const, areaKey: "saadiyat" as const };
    const incomplete = buildDiscoveredProjectFromOfficialPage(candidate, `{"unitType":"Villa","unitNumber":""}`);
    expect(incomplete.project).toBeUndefined();
    expect(incomplete.reason).toContain("does not yet publish unit records");
  });
});
