import fetcher from "@utils/fetcher";

const brands = {
  getNames: () => {
    return fetcher("brands/names", null, {
      method: "GET",
    });
  },
};

export default brands;
