import api from "@/app/helpers/baseApi";
import { Blog } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

type GetBlogParam = { page?: number; size?: number; search?: string };

export default function useGetBlogs(params: GetBlogParam) {
  const getBlogFn = async ({
    signal,
  }: {
    signal: AbortSignal;
  }): Promise<{ items: Blog[]; count: number }> => {
    const response = await api.get("blog", {
      params,
      signal,
    });
    return response.data;
  };

  return useQuery({
    queryKey: ["get-blogs", params],
    queryFn: getBlogFn,
    enabled: true,
  });
}
