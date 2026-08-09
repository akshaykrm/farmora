import fetcher from "@utils/fetcher";

const brands = {
  getNames: () => {
    return fetcher("brands/names", null, {
      method: "GET",
    });
  },
  create: (name: string) => {
    return fetcher("brands", JSON.stringify({ name }), {
      method: "POST",
    });
  },
};

export default brands;
