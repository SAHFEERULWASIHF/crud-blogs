import api from "@/app/helpers/baseApi";
import queryClient from "@/app/helpers/queryClient";
import { BlogInput } from "@/types/types";
import { Blog } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

const useCreateBlog = () => {
  const createBlogFn = async (values: BlogInput): Promise<Blog> => {
    const response = await api.post("blog", values);
    return response.data;
  };

  //useQuery:getting information from server like GET(ex: fetch user)
  //useMutation: send information within body like POST
  return useMutation({
    mutationFn: createBlogFn,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-blogs"], //when the post creation is completed succesfully the get blogs will be refetch automatically
      });
    },
  });
};

export default useCreateBlog;
